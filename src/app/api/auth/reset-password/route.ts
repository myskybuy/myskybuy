import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { consumeOtp } from "@/lib/otp";
import { hashPassword, publicUser } from "@/lib/password";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail || !code || !newPassword) {
    return NextResponse.json({ error: "Email, code and new password are required" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const ok = await consumeOtp(cleanEmail, "reset", String(code));
  if (!ok) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(newPassword) },
  });

  const session = await getSession();
  session.userId = updated.id;
  await session.save();

  return NextResponse.json({ success: true, user: publicUser(updated) });
}
