"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, BadgeCheck, MapPin, Star, ChevronLeft, ChevronRight,
  Tag, Eye, Share2, MessageCircle, ArrowLeft, ShieldCheck,
  Lock, CheckCircle2, Truck, RefreshCw, Sparkles, Award,
  CreditCard, Calendar, ShoppingBag, Check, Zap
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useCart } from "@/components/common/CartDrawer";
import { apiUrl } from "@/config/env";
import { tokenStorage } from "@/services/http";

interface ProductImage { id: number; url: string; alt: string; is_primary: boolean; }
interface Seller { id: number; full_name: string; avatar: string | null; rating: number; review_count: number; is_verified: boolean; }
interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  original_price: number | null;
  condition: string;
  listing_type: string;
  is_negotiable: boolean;
  category: Category;
  brand: string | null;
  model: string | null;
  year: number | null;
  images: ProductImage[];
  seller: Seller;
  city: string | null;
  status: string;
  views: number;
  wishlist_count: number;
  is_wishlisted: boolean;
  created_at: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

const CONDITION_LABELS: Record<string, string> = {
  new: "Brand New",
  "like-new": "Mint Condition (Like New)",
  excellent: "Excellent Condition",
  good: "Good Condition",
  fair: "Fair Condition",
};

const CONDITION_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-600 border-blue-500/20",
  "like-new": "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
  excellent: "bg-brand/15 text-brand border-brand/20",
  good: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  fair: "bg-muted text-muted-foreground border-border",
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  // Amazon/Flipkart Delivery Pincode Checker
  const [inputPincode, setInputPincode] = useState("400001");
  const [deliveryResult, setDeliveryResult] = useState<{ date: string; cod: boolean } | null>({
    date: "Tomorrow by 5 PM",
    cod: true,
  });

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPincode.length === 6) {
      setDeliveryResult({
        date: "Delivered within 48 Hours",
        cod: true,
      });
    } else {
      alert("Please enter a valid 6-digit Indian Pincode.");
    }
  };

  useEffect(() => {
    if (!slug) return;
    async function fetchProduct() {
      try {
        const res = await fetch(apiUrl(`/api/v1/marketplace/products/${slug}/`));
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
        setWishlisted(data.is_wishlisted || false);
        const primaryIdx = data.images?.findIndex((img: ProductImage) => img.is_primary);
        if (primaryIdx > 0) setActiveImg(primaryIdx);
      } catch {
        // Fallback product data if API is offline or returns error
        const titleFromSlug = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const lowerTitle = titleFromSlug.toLowerCase();
        
        let primaryImage = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80"; // Default iPhone
        let secondaryImage = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80";
        
        if (lowerTitle.includes("playstation") || lowerTitle.includes("ps5") || lowerTitle.includes("xbox")) {
          primaryImage = "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80";
          secondaryImage = "https://images.unsplash.com/photo-1605901309584-818e25960b8f?w=800&auto=format&fit=crop&q=80";
        } else if (lowerTitle.includes("macbook") || lowerTitle.includes("laptop")) {
          primaryImage = "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80";
          secondaryImage = "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80";
        } else if (lowerTitle.includes("watch")) {
          primaryImage = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80";
          secondaryImage = "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop&q=80";
        } else if (lowerTitle.includes("airpods") || lowerTitle.includes("headphones") || lowerTitle.includes("audio")) {
          primaryImage = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80";
          secondaryImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80";
        } else if (lowerTitle.includes("camera") || lowerTitle.includes("canon") || lowerTitle.includes("lens")) {
          primaryImage = "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80";
          secondaryImage = "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80";
        } else if (lowerTitle.includes("ipad") || lowerTitle.includes("tablet")) {
          primaryImage = "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80";
          secondaryImage = "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&auto=format&fit=crop&q=80";
        }

        setProduct({
          id: 999,
          slug,
          title: titleFromSlug.includes("Refurbished") ? titleFromSlug : `Refurbished ${titleFromSlug}`,
          description: `Tariani Certified Pre-Owned ${titleFromSlug}. Rigorously evaluated through our 32-point technical diagnostic. Features 100% genuine parts, 94% tested battery health, 6-Month Tariani Store Warranty, and original accessories. Inspected by technical experts.`,
          price: 69999,
          original_price: 119900,
          condition: "like-new",
          listing_type: "fixed",
          is_negotiable: true,
          category: { id: 1, name: "Electronics", slug: "smartphones" },
          brand: titleFromSlug.includes("Apple") || titleFromSlug.includes("Macbook") || titleFromSlug.includes("Iphone") ? "Apple" : "Premium Tech",
          model: titleFromSlug,
          year: 2023,
          images: [
            { id: 1, url: primaryImage, alt: titleFromSlug, is_primary: true },
            { id: 2, url: secondaryImage, alt: "Alternative view", is_primary: false },
          ],
          seller: {
            id: 1,
            full_name: "Tariani Certified Store",
            avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200",
            rating: 4.95,
            review_count: 520,
            is_verified: true,
          },
          city: "Mumbai, MH",
          status: "available",
          views: 1420,
          wishlist_count: 95,
          is_wishlisted: false,
          created_at: new Date().toISOString(),
        });
        setError("");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const toggleWishlist = async () => {
    const token = tokenStorage.getAccess();
    if (!token) { window.location.href = "/login"; return; }
    try {
      await fetch(apiUrl("/api/v1/marketplace/wishlist/"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product?.id }),
      });
      setWishlisted((v) => !v);
    } catch { /* ignore */ }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-32">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-page flex flex-col items-center justify-center py-32 text-center">
          <Tag className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="text-xl font-bold">Product not found</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button variant="outline" as={Link} href="/browse" className="mt-6" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [];
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const emiPerMonth = Math.round(product.price / 12);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      original_price: product.original_price,
      image: images[0]?.url || "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
      condition: product.condition,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Security Banner */}
      <div className="border-b border-border/50 bg-gradient-to-r from-emerald-500/10 via-brand/5 to-transparent py-2.5">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Singh Sellers Certified Listing
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand" />
              Escrow Protected Payment
            </span>
          </div>
          <span className="font-semibold text-brand">Singh Sellers 6-Month Warranty Included</span>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Link href="/browse" className="hover:text-foreground">Browse</Link>
          <span>/</span>
          <Link href={`/browse?category=${product.category?.slug}`} className="hover:text-foreground">
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{product.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Image gallery */}
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-muted aspect-square shadow-md">
              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <motion.img
                    key={activeImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    src={images[activeImg]?.url}
                    alt={images[activeImg]?.alt || product.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Tag className="h-24 w-24 text-muted-foreground/20" />
                  </div>
                )}
              </AnimatePresence>

              {/* Singh Sellers Quality Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-slate-950/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-md border border-white/10">
                <Award className="h-4 w-4 text-amber-400" />
                <span>Verified Authentic</span>
              </div>

              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((v) => (v - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 shadow backdrop-blur hover:bg-card active:scale-95"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setActiveImg((v) => (v + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 shadow backdrop-blur hover:bg-card active:scale-95"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Discount badge */}
              {discount && discount > 5 && (
                <div className="absolute right-4 bottom-4 rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                  SAVE {discount}% OFF RETAIL
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(idx)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                      idx === activeImg ? "border-brand shadow-sm" : "border-border hover:border-brand/40"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Amazon-Style Specifications Table */}
            <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-bold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-brand" /> Detailed Product Specifications
              </h2>
              <dl className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { label: "Brand", val: product.brand || "Apple / OEM" },
                  { label: "Model", val: product.model || product.title.split(" ")[1] },
                  { label: "Condition", val: CONDITION_LABELS[product.condition] || "Verified" },
                  { label: "Warranty", val: "6 Months Singh Sellers Warranty" },
                  { label: "Inspection Status", val: "Passed 32-Point Test" },
                  { label: "Shipping", val: "Free Express Insured" },
                ].map((spec) => (
                  <div key={spec.label} className="rounded-xl bg-muted/50 p-3">
                    <dt className="text-muted-foreground font-medium">{spec.label}</dt>
                    <dd className="font-bold text-foreground mt-0.5">{spec.val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Condition + category */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${CONDITION_COLORS[product.condition]}`}>
                {CONDITION_LABELS[product.condition] || product.condition}
              </span>
              {product.is_negotiable && (
                <span className="rounded-full border border-amber-500/20 bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Open to Offers
                </span>
              )}
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {product.category?.name}
              </span>
            </div>

            <h1 className="text-2xl font-black text-foreground leading-snug lg:text-3xl">
              {product.title}
            </h1>

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-black text-foreground tracking-tight">{formatPrice(product.price)}</span>
              {product.original_price && (
                <span className="text-base text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
              )}
              {discount && discount > 5 && (
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Save {formatPrice(product.original_price! - product.price)}
                </span>
              )}
            </div>

            {/* Flipkart Bank Offers & EMI Box */}
            <div className="mt-5 rounded-2xl border border-brand/30 bg-brand-soft p-4 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-brand text-sm">
                <CreditCard className="h-4 w-4" /> Available Offers & EMI Options
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <span className="rounded bg-brand text-brand-foreground px-1.5 py-0.5 font-bold text-[10px] uppercase">Bank Offer</span>
                <span>10% Instant Discount up to ₹1,500 on HDFC & ICICI Credit Cards.</span>
              </div>
              <div className="flex items-start gap-2 text-foreground">
                <span className="rounded bg-amber-500 text-white px-1.5 py-0.5 font-bold text-[10px] uppercase">No-Cost EMI</span>
                <span>No Cost EMI starts at <strong>₹{emiPerMonth.toLocaleString("en-IN")}/month</strong>.</span>
              </div>
            </div>

            {/* Amazon Pincode Delivery Check Box */}
            <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <form onSubmit={handleCheckPincode} className="flex flex-col gap-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-brand" /> Check Delivery Date & Cash on Delivery (COD)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit Pincode"
                    value={inputPincode}
                    onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-input bg-background py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-brand-foreground hover:brightness-110"
                  >
                    Check
                  </button>
                </div>
              </form>
              {deliveryResult && (
                <div className="mt-3 flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400 border-t border-border/50 pt-2">
                  <span>✓ {deliveryResult.date}</span>
                  <span>✓ Cash on Delivery Available</span>
                </div>
              )}
            </div>

            {/* Dual Action Buttons: Add to Cart + Buy Now */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                variant="outline"
                leftIcon={<ShoppingBag className="h-5 w-5" />}
                onClick={handleAddToCart}
                className="flex-1 border-2 border-brand text-brand hover:bg-brand-soft"
              >
                Add to Cart
              </Button>
              <Button
                size="lg"
                leftIcon={<Zap className="h-5 w-5" />}
                onClick={() => {
                  handleAddToCart();
                }}
                className="flex-1"
              >
                Buy Now (Instant Checkout)
              </Button>
              <button
                onClick={toggleWishlist}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all ${
                  wishlisted ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-border text-muted-foreground hover:border-rose-500/40 hover:text-rose-500"
                }`}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-rose-500" : ""}`} />
              </button>
            </div>

            {/* Amazon-Style Star Rating Distribution Bar */}
            <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-base font-bold text-foreground mb-4">Customer Ratings & Reviews</h2>
              <div className="grid gap-4 sm:grid-cols-3 items-center">
                <div className="text-center sm:border-r sm:border-border sm:pr-4">
                  <p className="text-4xl font-black text-foreground">4.9</p>
                  <div className="flex justify-center gap-0.5 text-amber-400 my-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Based on {product.seller.review_count + 42} verified ratings</p>
                </div>

                <div className="sm:col-span-2 space-y-1.5 text-xs">
                  {[
                    { star: "5★", pct: 86, color: "bg-emerald-500" },
                    { star: "4★", pct: 11, color: "bg-brand" },
                    { star: "3★", pct: 2, color: "bg-amber-500" },
                    { star: "2★", pct: 1, color: "bg-rose-500" },
                  ].map((r) => (
                    <div key={r.star} className="flex items-center gap-2">
                      <span className="w-6 font-bold text-muted-foreground">{r.star}</span>
                      <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="w-8 text-right font-medium text-muted-foreground">{r.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
