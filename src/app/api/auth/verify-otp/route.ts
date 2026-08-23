import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWelcomeEmail } from "@/lib/email";
import { consumeOtp, type OtpPurpose } from "@/lib/otp";
import { publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, purpose, code } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();
  const otpPurpose = purpose === "signup" ? "signup" : purpose === "login" ? "login" : "";

  if (!cleanEmail || !otpPurpose || !code) {
    return NextResponse.json({ error: "Email, purpose and code are required" }, { status: 400 });
  }

  const ok = await consumeOtp(cleanEmail, otpPurpose as OtpPurpose, String(code));
  if (!ok) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const wasUnverified = !user.emailVerified;
  const updated = wasUnverified
    ? await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } })
    : user;

  const session = await getSession();
  session.userId = updated.id;
  await session.save();

  if (otpPurpose === "signup" && wasUnverified) {
    await sendWelcomeEmail(updated);
  }

  return NextResponse.json({ success: true, user: publicUser(updated) });
}
