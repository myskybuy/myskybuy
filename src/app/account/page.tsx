"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import OtpStep from "@/components/OtpStep";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";

type User = { id: number; name: string; email: string };
type Order = { id: number; total: number; status: string; createdAt: string; items: unknown[] };

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  async function loadAccount() {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    setUser(me.user);
    if (me.user) {
      const data = await fetch("/api/account/orders").then((r) => r.json());
      setOrders(Array.isArray(data) ? data : []);
    }
  }

  useEffect(() => {
    loadAccount();
  }, []);

  async function doLogin() {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
    });
    const data = await res.json();
    if (data.needsOtp && data.email) {
      toast.success("Verification code sent");
      setOtpEmail(data.email);
    } else if (data.success) {
      toast.success("Logged in");
      loadAccount();
    } else {
      toast.error(data.error || "Login failed");
    }
  }

  async function doSignup() {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
    });
    const data = await res.json();
    if (data.success) {
      toast.success("Account created. You're logged in.");
      loadAccount();
    } else {
      toast.error(data.error || "Sign up failed");
    }
  }

  async function doLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOrders([]);
    toast.success("Logged out");
    loadAccount();
  }

  if (user) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <div className="cart-page">
          <h2>My Account</h2>
          <div className="cart-summary" style={{ marginBottom: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
            <div style={{ color: "var(--color-muted)", fontSize: 14 }}>{user.email}</div>
            <Link href="/profile" className="btn btn-outline" style={{ marginTop: 16, marginRight: 10, display: "inline-block" }}>
              View profile
            </Link>
            <button className="btn btn-outline" style={{ marginTop: 16, border: "1px solid var(--color-border)" }} onClick={doLogout}>
              Log out
            </button>
          </div>
          <h2 style={{ fontSize: 20 }}>My Orders</h2>
          {orders.length ? (
            orders.map((o) => (
              <div key={o.id} className="order-card">
                <div className="order-head">
                  <span>Order #{o.id}</span>
                  <span className={`status-tag ${o.status}`}>{o.status}</span>
                </div>
                <div style={{ color: "var(--color-muted)", fontSize: 13.5, marginBottom: 6 }}>
                  {new Date(o.createdAt).toLocaleDateString()} • {Array.isArray(o.items) ? o.items.length : 0} item(s)
                </div>
                <div style={{ fontWeight: 700 }}>₹{o.total}</div>
              </div>
            ))
          ) : (
            <p style={{ color: "var(--color-muted)" }}>
              No orders yet. <Link href="/shop">Start shopping →</Link>
            </p>
          )}
        </div>
        <SiteFooter />
      </StoreShell>
    );
  }

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="account-page">
        <h2>{otpEmail ? "Verify email" : "My Account"}</h2>
        {otpEmail ? (
          <OtpStep
            email={otpEmail}
            purpose="login"
            onVerified={() => {
              setOtpEmail(null);
              loadAccount();
            }}
            onBack={() => setOtpEmail(null)}
          />
        ) : null}
        {otpEmail ? null : (
          <>
            <div className="account-tabs">
              <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
                Log in
              </button>
              <button className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>
                Sign up
              </button>
            </div>

            {tab === "login" ? (
              <div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="Your password" />
                </div>
                <button className="btn btn-accent" style={{ width: "100%" }} onClick={doLogin}>
                  Log in
                </button>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label>Full name</label>
                  <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="At least 6 characters" />
                </div>
                <button className="btn btn-accent" style={{ width: "100%" }} onClick={doSignup}>
                  Create account
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
