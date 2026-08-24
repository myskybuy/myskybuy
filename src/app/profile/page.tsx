"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  emailVerified: boolean;
};
type Order = { id: number; total: number; status: string; createdAt: string; items: unknown[] };

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"details" | "password" | "orders">("details");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  function fillForm(u: User) {
    setName(u.name || "");
    setPhone(u.phone || "");
    setAddress(u.address || "");
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (d) => {
        if (!d.user) {
          router.replace("/account");
          return;
        }
        setUser(d.user);
        fillForm(d.user);
        const orderRes = await fetch("/api/account/orders");
        const orderData = await orderRes.json();
        setOrders(Array.isArray(orderData) ? orderData : []);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/account");
  }

  function cancelEdit() {
    if (user) fillForm(user);
    setEditing(false);
  }

  async function saveProfile() {
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        fillForm(data.user);
        setEditing(false);
        toast.success("Profile updated");
      } else {
        toast.error(data.error || "Could not update profile");
      }
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!currentPassword || !newPassword) return toast.error("Fill in both password fields");
    if (newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("New passwords do not match");
    setChangingPassword(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password changed");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Could not change password");
      }
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <div className="cart-page"><p>Loading…</p></div>
        <SiteFooter />
      </StoreShell>
    );
  }

  if (!user) return null;

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="cart-page profile-page">
        <h2>My Profile</h2>

        <div className="profile-card">
          <div className="profile-avatar" aria-hidden>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">
              {user.email}
              {user.emailVerified ? <span className="profile-verified-badge">Verified</span> : null}
            </div>
          </div>
          <button type="button" className="btn btn-outline" onClick={logout}>
            Log out
          </button>
        </div>

        <div className="account-tabs profile-tabs">
          <button className={tab === "details" ? "active" : ""} onClick={() => setTab("details")}>
            Profile details
          </button>
          <button className={tab === "password" ? "active" : ""} onClick={() => setTab("password")}>
            Change password
          </button>
          <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>
            My orders {orders.length ? `(${orders.length})` : ""}
          </button>
        </div>

        {tab === "details" ? (
          <div className="profile-details-card">
            <div className="profile-details-head">
              <h3 className="profile-section-title">Personal information</h3>
              {editing ? null : (
                <button type="button" className="btn btn-outline profile-edit-btn" onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Full name</label>
              <input
                type="text"
                value={name}
                disabled={!editing}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" value={user.email} disabled />
            </div>

            <div className="form-group">
              <label>Phone number</label>
              <input
                type="tel"
                value={phone}
                disabled={!editing}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label>Delivery address</label>
              <textarea
                rows={3}
                value={address}
                disabled={!editing}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House no, street, city, state, pincode"
              />
            </div>

            {editing ? (
              <div className="profile-edit-actions">
                <button type="button" className="btn btn-accent" onClick={saveProfile} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button type="button" className="btn btn-outline" onClick={cancelEdit} disabled={saving}>
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
        ) : tab === "password" ? (
          <div className="profile-details-card">
            <h3 className="profile-section-title">Change password</h3>
            <div className="form-group">
              <label>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Your current password"
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
              />
            </div>
            <button type="button" className="btn btn-accent" style={{ width: "100%" }} onClick={changePassword} disabled={changingPassword}>
              {changingPassword ? "Updating…" : "Update password"}
            </button>
          </div>
        ) : (
          <div>
            {orders.length ? (
              orders.map((o) => (
                <div key={o.id} className="order-card">
                  <div className="order-head">
                    <span>Order #{o.id}</span>
                    <span className={`status-tag ${o.status}`}>{o.status}</span>
                  </div>
                  <div style={{ color: "var(--color-muted)", fontSize: 13.5, marginBottom: 6 }}>
                    {new Date(o.createdAt).toLocaleDateString()} · {Array.isArray(o.items) ? o.items.length : 0} item(s)
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
        )}
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
