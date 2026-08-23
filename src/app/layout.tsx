import type { Metadata } from "next";
import AppToaster from "@/components/AppToaster";
import { CartProvider } from "@/components/CartProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "MySkyBuy — Bags, Backpacks & Travel Essentials",
  description: "Bags, backpacks, travel & luggage e-commerce store",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icon.png" }],
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/style.css" />
      </head>
      <body>
        <CartProvider>
          {children}
          <AppToaster />
        </CartProvider>
      </body>
    </html>
  );
}
