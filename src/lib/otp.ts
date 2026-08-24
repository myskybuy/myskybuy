import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendOtpEmail, sendPasswordResetEmail } from "@/lib/email";

export type OtpPurpose = "signup" | "login" | "reset";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_MS = 60 * 1000;

export function hashOtp(code: string) {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

function hashesEqual(a: string, b: string) {
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export async function issueOtp(email: string, purpose: OtpPurpose) {
  const recent = await prisma.otpCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_MS) {
    const wait = Math.ceil((RESEND_MS - (Date.now() - recent.createdAt.getTime())) / 1000);
    return { ok: false as const, error: `Please wait ${wait}s before requesting another code`, status: 429 };
  }

  await prisma.otpCode.deleteMany({ where: { email, purpose } });
  const code = String(crypto.randomInt(100000, 1000000));
  await prisma.otpCode.create({
    data: {
      email,
      codeHash: hashOtp(code),
      purpose,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  const sent = purpose === "reset" ? await sendPasswordResetEmail(email, code) : await sendOtpEmail(email, code);
  if (!sent && process.env.NODE_ENV === "production") {
    return { ok: false as const, error: "Could not send verification email. Please try again.", status: 503 };
  }
  return { ok: true as const };
}

export async function consumeOtp(email: string, purpose: OtpPurpose, code: string) {
  const row = await prisma.otpCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: "desc" },
  });
  if (!row || row.expiresAt.getTime() < Date.now() || !hashesEqual(row.codeHash, hashOtp(code))) {
    return false;
  }
  await prisma.otpCode.deleteMany({ where: { email, purpose } });
  return true;
}
