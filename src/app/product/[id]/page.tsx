"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Product } from "@/components/ProductCard";
import SafeImage from "@/components/SafeImage";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import StoreShell from "@/components/StoreShell";
import { useCart } from "@/components/CartProvider";

export default function ProductPage() {
  const params = useParams();
  const { addToCart, isInCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [feedback, setFeedback] = useState<"idle" | "added">("idle");

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then(setProduct);
  }, [params.id]);

  useEffect(() => {
    if (feedback !== "added") return;
    const t = setTimeout(() => setFeedback("idle"), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

  if (!product) {
    return (
      <StoreShell>
        <SiteHeader showSearch={false} />
        <div className="container" style={{ padding: "40px 24px" }}>
          Loading…
        </div>
        <SiteFooter />
      </StoreShell>
    );
  }

  const discount = product.price > 0 ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const inCart = isInCart(product.id);
  const btnLabel = feedback === "added" ? "Item added to cart" : inCart ? "In cart" : "Add to cart";

  return (
    <StoreShell>
      <SiteHeader showSearch={false} />
      <div className="product-page">
        <div className="product-gallery">
          {discount > 0 ? <span className="badge-sale">{discount}% OFF</span> : null}
          <SafeImage src={product.image} alt={product.name} />
        </div>
        <div className="product-info">
          <span className="brand">{product.brand}</span>
          <h1>{product.name}</h1>
          <div className="price-row">
            <span className="price-now">₹{product.salePrice}</span>
            {product.price > product.salePrice ? <span className="price-old">₹{product.price}</span> : null}
          </div>
          <ul className="product-specs">
            <li><span>Brand</span> {product.brand}</li>
            <li><span>Category</span> {product.category}</li>
            <li><span>SKU</span> #{product.id}</li>
          </ul>
          <p className="product-desc">{product.description}</p>
          <div className="product-perks">
            <span>Cash on Delivery</span>
            <span>7-day return</span>
            <span>Ships across India</span>
          </div>
          <div className="qty-row">
            <label>Quantity</label>
            <div className="qty-box">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(10, q + 1))} disabled={qty >= 10} aria-label="Increase quantity">
                +
              </button>
            </div>
          </div>
          <div className="product-actions">
            <button
              className={`btn btn-accent ${feedback === "added" ? "added" : ""}`}
              type="button"
              onClick={() => {
                addToCart(
                  { id: product.id, name: product.name, image: product.image, salePrice: product.salePrice },
                  qty
                );
                setFeedback("added");
                toast.success("Item added to cart");
              }}
            >
              {btnLabel}
            </button>
            <Link href="/cart" className="btn btn-outline">
              Go to cart
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </StoreShell>
  );
}
