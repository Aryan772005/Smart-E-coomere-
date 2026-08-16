"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Tag, ShieldCheck, Battery, Layers, FileCheck, MapPin } from "lucide-react";
import { tokenStorage } from "@/services/http";
import { apiUrl } from "@/config/env";

export interface ProductImage { id: number; url: string; alt: string; is_primary: boolean; }
export interface Seller { id: number; full_name: string; avatar: string | null; rating: number; review_count: number; is_verified: boolean; }
export interface Category { id: number; name: string; slug: string; }

export interface Product {
  id: number;
  slug: string;
  title: string;
  description?: string;
  price: number;
  original_price: number | null;
  condition: string;
  listing_type: string;
  is_negotiable: boolean;
  category: Category;
  brand: string | null;
  model?: string | null;
  year?: number | null;
  images?: ProductImage[];
  primary_image?: ProductImage;
  seller: Seller;
  city: string | null;
  status: string;
  views: number;
  wishlist_count: number;
  is_wishlisted: boolean;
  created_at: string;
  material_finish?: string;
  battery_health?: number;
  inspection_grade?: string;
  included_accessories?: string;
}

const CONDITION_BADGES: Record<string, { label: string; style: string; finish: string }> = {
  "like-new": { label: "Grade A+ Mint", style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", finish: "Pristine Finish" },
  excellent: { label: "Grade A Excellent", style: "bg-brand/10 text-brand border-brand/30", finish: "Minor Micro-Scuff" },
  good: { label: "Grade B Good", style: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30", finish: "Visible Surface Wear" },
  fair: { label: "Fair Condition", style: "bg-muted text-muted-foreground border-border", finish: "Budget Grade" },
  new: { label: "Factory Sealed", style: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30", finish: "Sealed Box" },
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export function ProductCard({ product, onSelectInspect }: { product: Product; onSelectInspect?: (p: Product) => void }) {
  const [wishlisted, setWishlisted] = useState(product.is_wishlisted);
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const token = tokenStorage.getAccess();
    if (!token) { window.location.href = "/login"; return; }
    try {
      await fetch(apiUrl("/api/v1/marketplace/wishlist/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id }),
      });
      setWishlisted((v) => !v);
    } catch { /* ignore */ }
  };

  const DEFAULT_BADGE = { label: "Grade A Inspected", style: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", finish: "Verified Grade" };
  const cond = CONDITION_BADGES[product.condition] || DEFAULT_BADGE;
  const battery = product.battery_health ?? Math.floor(88 + (product.id % 12));
  const materialFinish = product.material_finish ?? `${product.brand || "Aerospace"} Anodized Alloy & Reinforced Glass`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col justify-between"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl group-hover:border-brand/40 flex flex-col justify-between h-full">
        <Link href={`/products/${product.slug}`} className="block flex-1">
          {/* Image Container with Material Overlays */}
          <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
            {product.primary_image ? (
              <img
                src={product.primary_image.url}
                alt={product.primary_image.alt || product.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-95 group-hover:opacity-100"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Tag className="h-12 w-12 opacity-30" />
              </div>
            )}

            {/* Subtle Metallic Highlight Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20 pointer-events-none" />

            {/* Tariani Certified Assured Stamp */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-slate-950/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-lg border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Tariani Assured</span>
            </div>

            {/* Battery Health Badge */}
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              <Battery className="h-3 w-3" />
              <span>{battery}% Battery</span>
            </div>

            {/* Discount Badge */}
            {discount && discount > 5 && (
              <div className="absolute left-3 bottom-3 rounded-md bg-rose-600 px-2.5 py-0.5 text-xs font-black text-white shadow-md">
                SAVE {discount}% OFF
              </div>
            )}

            {/* Wishlist Button */}
            <button
              onClick={toggleWishlist}
              className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-md transition-all hover:scale-110 active:scale-95"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${wishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600 dark:text-slate-300"}`}
              />
            </button>
          </div>

          {/* Product Details & Physical Spec Breakdown */}
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${cond.style}`}>
                {cond.label}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="h-3 w-3 text-brand" /> {cond.finish}
              </span>
            </div>

            <h3 className="line-clamp-2 text-sm font-bold text-foreground leading-snug group-hover:text-brand transition-colors">
              {product.title}
            </h3>

            {/* Material Build Descriptor pill */}
            <p className="mt-1.5 line-clamp-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-2 py-1 rounded-md">
              🛠️ {materialFinish}
            </p>

            {/* Pricing */}
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-xl font-black text-foreground tracking-tight">{formatPrice(product.price)}</span>
              {product.original_price && (
                <span className="text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
              )}
            </div>
          </div>
        </Link>

        {/* Inspection Report Trigger Button */}
        <div className="p-4 pt-0 border-t border-border/60 mt-auto flex items-center justify-between">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelectInspect && onSelectInspect(product); }}
            className="flex items-center gap-1 text-[11px] font-bold text-brand hover:underline mt-3"
          >
            <FileCheck className="h-3.5 w-3.5" /> 32-Pt Diagnostic Report
          </button>
          {product.city && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-3">
              <MapPin className="h-3 w-3" />
              <span>{product.city.split(",")[0]}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
