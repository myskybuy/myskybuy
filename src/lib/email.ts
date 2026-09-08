import nodemailer from "nodemailer";

const EMAIL_ENABLED = String(process.env.EMAIL_ENABLED || "false").toLowerCase() === "true";
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD || "";

const transporter =
  EMAIL_ENABLED && EMAIL_USER && EMAIL_APP_PASSWORD
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD },
      })
    : null;

type OrderItem = { name: string; qty: number; salePrice: number };

type OrderEmail = {
  id: number;
  email: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
};

function logEmailError(label: string, err: unknown) {
  console.error(`[email] ${label}`, err);
}

export async function sendOrderConfirmationEmail(order: OrderEmail) {
  if (!order.email) {
    console.warn("[email] order confirmation skipped: empty recipient");
    return false;
  }
  if (!transporter) {
    console.warn("[email] order confirmation skipped: EMAIL_ENABLED / credentials not set");
    return false;
  }

  const itemsHTML = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.name} × ${item.qty}</td><td style="padding:8px 0; text-align:right;">₹${item.salePrice * item.qty}</td></tr>`
    )
    .join("");

  try {
    await transporter.sendMail({
      from: `"MySkyBuy" <${EMAIL_USER}>`,
      to: order.email,
      subject: `Order MSB-ORD-${String(order.id).padStart(6, "0")} confirmed — MySkyBuy`,
      html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#0d5c53;">Your order successfully completed ✅</h2>
        <p>Hi ${order.customerName}, thanks for shopping at MySkyBuy.</p>
        <p><strong>Order MSB-ORD-${String(order.id).padStart(6, "0")}</strong> · ${order.paymentMethod}</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHTML}</table>
        <p style="font-size:18px;font-weight:700;">Total: ₹${order.total}</p>
      </div>
    `,
    });
    return true;
  } catch (err) {
    logEmailError("order confirmation failed", err);
    return false;
  }
}

export async function sendWelcomeEmail(user: { name: string; email: string }) {
  if (!transporter) {
    console.warn("[email] welcome skipped: EMAIL_ENABLED / credentials not set");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"MySkyBuy" <${EMAIL_USER}>`,
      to: user.email,
      subject: "Welcome to MySkyBuy",
      html: `<p>Hi ${user.name}, your MySkyBuy account is ready. Happy shopping!</p>`,
    });
    return true;
  } catch (err) {
    logEmailError("welcome failed", err);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, code: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[MySkyBuy password reset OTP] ${email}: ${code}`);
  }
  if (!transporter) {
    console.warn("[email] password reset skipped: EMAIL_ENABLED / credentials not set");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"MySkyBuy" <${EMAIL_USER}>`,
      to: email,
      subject: "Reset your MySkyBuy password",
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#0d5c53;">Reset your password</h2>
          <p>Use this code to reset your MySkyBuy account password:</p>
          <p style="font-size:28px;font-weight:800;letter-spacing:6px;">${code}</p>
          <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    logEmailError("password reset failed", err);
    return false;
  }
}

export async function sendOtpEmail(email: string, code: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[MySkyBuy OTP] ${email}: ${code}`);
  }
  if (!transporter) {
    console.warn("[email] OTP skipped: EMAIL_ENABLED / credentials not set");
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"MySkyBuy" <${EMAIL_USER}>`,
      to: email,
      subject: "Your MySkyBuy verification code",
      html: `
        <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#0d5c53;">Verify your email</h2>
          <p>Your MySkyBuy verification code is:</p>
          <p style="font-size:28px;font-weight:800;letter-spacing:6px;">${code}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    logEmailError("OTP failed", err);
    return false;
  }
}
