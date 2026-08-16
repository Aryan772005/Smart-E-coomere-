import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/components/common/CartDrawer";
import "./globals.css";

const APP_NAME = "Tariani Sellers";
const APP_DEFAULT_TITLE = "Tariani Sellers — Certified Pre-Owned & Refurbished Electronics";
const APP_TITLE_TEMPLATE = "%s | Tariani Sellers";
const APP_DESCRIPTION =
  "Buy and sell verified pre-owned iPhones, MacBooks, gaming consoles and audio gear with Tariani Sellers Certified Warranty and Escrow Protection.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "tariani sellers",
    "buy pre-owned phones",
    "sell old laptop",
    "refurbished macbook",
    "recommerce india",
  ],
  authors: [{ name: "Tariani Sellers" }],
  creator: "Tariani Sellers",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f19" },
  ],
  width: "device-width",
  initialScale: 1,
};

import { Footer } from "@/components/common/Footer";
import { LiveActivityToast } from "@/components/common/LiveActivityToast";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var stored = localStorage.getItem("singh_sellers_theme");
                var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                if (theme === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (e) {}
            })();
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <div className="flex min-h-screen flex-col">
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <LiveActivityToast />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
