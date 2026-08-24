import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { isValidEmail } from "@/lib/password";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const cleanEmail = (email || "").trim().toLowerCase();

  if (!cleanEmail) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!isValidEmail(cleanEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (!user) {
    return NextResponse.json({ error: "No account found with this email" }, { status: 404 });
  }

  const otp = await issueOtp(cleanEmail, "reset");
  if (!otp.ok) {
    return NextResponse.json({ error: otp.error }, { status: otp.status });
  }

  return NextResponse.json({ success: true });
}
