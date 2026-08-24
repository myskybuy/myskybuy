"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type User = { id: number; name: string; email: string };

type ForgotPasswordStepProps = {
  onDone: (user: User) => void;
  onBack: () => void;
};

export default function ForgotPasswordStep({ onDone, onBack }: ForgotPasswordStepProps) {
  const [stage, setStage] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(60);

  useEffect(() => {
    if (stage !== "reset" || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, resendIn]);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reset code sent to your email");
        setResendIn(60);
        setStage("reset");
      } else {
        toast.error(data.error || "Could not send reset code");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose: "reset" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Code resent");
        setResendIn(60);
      } else {
        toast.error(data.error || "Could not resend code");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        toast.success("Password reset. You're logged in.");
        onDone(data.user);
      } else {
        toast.error(data.error || "Could not reset password");
      }
    } finally {
      setLoading(false);
    }
  }

  if (stage === "email") {
    return (
      <form onSubmit={handleSendCode}>
        <p className="otp-hint">Enter your account email — we&apos;ll send you a reset code.</p>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading}>
          {loading ? "Please wait…" : "Send reset code"}
        </button>
        <div className="otp-actions">
          <button type="button" className="otp-link" onClick={onBack}>
            Back to login
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleReset}>
      <p className="otp-hint">
        Enter the 6-digit code sent to <strong>{email}</strong> and choose a new password.
      </p>
      <div className="form-group">
        <label>Verification code</label>
        <input
          className="otp-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          required
        />
      </div>
      <div className="form-group">
        <label>New password</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 6 characters"
          minLength={6}
          required
        />
      </div>
      <div className="form-group">
        <label>Confirm new password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter new password"
          minLength={6}
          required
        />
      </div>
      <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading || code.length !== 6}>
        {loading ? "Please wait…" : "Reset password"}
      </button>
      <div className="otp-actions">
        <button type="button" className="otp-link" onClick={handleResend} disabled={loading || resendIn > 0}>
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
        <button type="button" className="otp-link" onClick={() => setStage("email")}>
          Back
        </button>
      </div>
    </form>
  );
}
