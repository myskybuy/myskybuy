"use client";

import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

type User = { id: number; name: string; email: string };

type OtpStepProps = {
  email: string;
  purpose: "signup" | "login";
  onVerified: (user: User) => void;
  onBack?: () => void;
};

export default function OtpStep({ email, purpose, onVerified, onBack }: OtpStepProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(60);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose, code }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        toast.success("Logged in");
        onVerified(data.user);
      } else {
        toast.error(data.error || "Invalid or expired code");
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
        body: JSON.stringify({ email, purpose }),
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

  return (
    <form onSubmit={handleVerify}>
      <p className="otp-hint">
        Enter the 6-digit code sent to <strong>{email}</strong>
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
      <button className="btn btn-accent" style={{ width: "100%" }} type="submit" disabled={loading || code.length !== 6}>
        {loading ? "Please wait…" : "Verify"}
      </button>
      <div className="otp-actions">
        <button type="button" className="otp-link" onClick={handleResend} disabled={loading || resendIn > 0}>
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
        {onBack ? (
          <button type="button" className="otp-link" onClick={onBack}>
            Back
          </button>
        ) : null}
      </div>
    </form>
  );
}
