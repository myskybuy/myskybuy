"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useCart } from "./CartProvider";

type User = { id: number; name: string; email: string };

export default function SiteHeader({ showSearch = true }: { showSearch?: boolean }) {
  const router = useRouter();
  const { cartCount } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <span className="logo-my">MY</span>
          <span className="logo-skybuy">SKYBUY</span>
        </Link>
        {showSearch ? (
          <form onSubmit={onSearch} className="search-wrap">
            <span className="search-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" />
              </svg>
            </span>
            <input
              className="search-box"
              placeholder="Search backpacks, slings, wallets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </form>
        ) : null}
        <nav className="main-nav">
          <Link href="/shop?category=Backpacks">Backpacks</Link>
          <Link href="/shop?category=Travel%20%26%20Luggage">Travel &amp; Luggage</Link>
          <Link href="/shop?category=Handbags%20%26%20Totes">Handbags &amp; Totes</Link>
          <Link href="/shop?category=Slings%20%26%20Crossbody">Slings</Link>
          <Link href="/shop?category=Wallets%20%26%20Purses">Wallets &amp; Purses</Link>
          <Link href="/shop?sale=1">Price Drops</Link>
          <Link href="/about">About Us</Link>
        </nav>
        <div className="header-actions">
          <Link href={user ? "/profile" : "/account"} className="profile-link" title={user ? "My profile" : "Login / Sign up"}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="profile-label">{user ? user.name.split(" ")[0] : "Account"}</span>
          </Link>
          <Link href="/cart" className="cart-pill">
            My Cart ({cartCount})
          </Link>
        </div>
      </div>
    </header>
  );
}
