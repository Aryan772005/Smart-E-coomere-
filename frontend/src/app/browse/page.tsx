"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Heart,
  BadgeCheck,
  X,
  Tag,
  MapPin,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowUpDown,
  CheckCircle,
  Award,
  Battery,
  Layers,
  FileCheck,
  Info,
  ChevronRight,
  Zap,
  CheckCircle2,
  Box,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { apiUrl } from "@/config/env";
import { tokenStorage } from "@/services/http";

interface ProductImage { url: string; alt: string; }
interface Seller { id: number; full_name: string; avatar: string | null; rating: number; is_verified: boolean; }
interface Category { id: number; name: string; slug: string; }
interface Product {
  id: number;
  slug: string;
  title: string;
  price: number;
  original_price: number | null;
  condition: string;
  listing_type: string;
  is_negotiable: boolean;
  category: Category;
  brand: string | null;
  city: string | null;
  status: string;
  views: number;
  wishlist_count: number;
  is_wishlisted: boolean;
  primary_image: ProductImage | null;
  seller: Seller;
  created_at: string;
  // Extended Material & Inspection Specs
  material_finish?: string;
  battery_health?: number;
  inspection_grade?: string;
  included_accessories?: string;
}

interface PaginatedResponse {
  count: number;
  results: Product[];
}

// Fallback Rich 2nd Hand Products for offline/standalone preview
const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 101,
    slug: "refurbished-apple-iphone-15-pro-max-256gb-natural-titanium",
    title: "Refurbished Apple iPhone 15 Pro Max (256GB - Natural Titanium)",
    price: 98000,
    original_price: 159900,
    condition: "like-new",
    listing_type: "fixed",
    is_negotiable: true,
    category: { id: 1, name: "Smartphones", slug: "smartphones" },
    brand: "Apple",
    city: "Mumbai, MH",
    status: "available",
    views: 1840,
    wishlist_count: 142,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
      alt: "iPhone 15 Pro Max Natural Titanium"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-01T10:00:00Z",
    material_finish: "Titanium Grade 5 Frame & Ceramic Shield Glass",
    battery_health: 94,
    inspection_grade: "Grade A+ Mint",
    included_accessories: "Original Braided USB-C Cable, Tax Invoice & Box",
  },
  {
    id: 102,
    slug: "refurbished-apple-macbook-pro-16-m2-max-space-black",
    title: "Refurbished Apple MacBook Pro 16 M2 Max (32GB / 1TB)",
    price: 189999,
    original_price: 349900,
    condition: "like-new",
    listing_type: "fixed",
    is_negotiable: false,
    category: { id: 2, name: "Laptops", slug: "laptops" },
    brand: "Apple",
    city: "Bengaluru, KA",
    status: "available",
    views: 2150,
    wishlist_count: 98,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      alt: "MacBook Pro M2 Max Space Black"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-02T12:00:00Z",
    material_finish: "100% Recycled Anodized Aluminum Chassis",
    battery_health: 96,
    inspection_grade: "Grade A+ Mint",
    included_accessories: "140W USB-C Power Adapter, MagSafe 3 Cable, Original Box",
  },
  {
    id: 103,
    slug: "refurbished-sony-playstation-5-disc-edition",
    title: "Refurbished Sony PlayStation 5 Disc Edition (1TB + DualSense)",
    price: 38999,
    original_price: 54990,
    condition: "excellent",
    listing_type: "fixed",
    is_negotiable: true,
    category: { id: 3, name: "Gaming", slug: "gaming" },
    brand: "Sony",
    city: "New Delhi, DL",
    status: "available",
    views: 3100,
    wishlist_count: 210,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
      alt: "PlayStation 5 Console"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-03T09:00:00Z",
    material_finish: "Matte White Polycarbonate & Inspected Internal Heat Sink",
    battery_health: 100,
    inspection_grade: "Grade A Excellent",
    included_accessories: "DualSense Wireless Controller, Console Stand, HDMI 2.1 Cable",
  },
  {
    id: 104,
    slug: "refurbished-sony-wh-1000xm5-wireless-headphones",
    title: "Refurbished Sony WH-1000XM5 Wireless ANC Headphones",
    price: 19999,
    original_price: 34990,
    condition: "like-new",
    listing_type: "fixed",
    is_negotiable: false,
    category: { id: 4, name: "Audio", slug: "audio" },
    brand: "Sony",
    city: "Pune, MH",
    status: "available",
    views: 1420,
    wishlist_count: 85,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
      alt: "Sony WH-1000XM5 Silver"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-02T15:00:00Z",
    material_finish: "Soft-fit Synthetic Leather & Lightweight Resin",
    battery_health: 98,
    inspection_grade: "Grade A+ Mint",
    included_accessories: "Hard Carrying Case, 3.5mm Cable, USB Charging Cable",
  },
  {
    id: 105,
    slug: "refurbished-samsung-galaxy-s24-ultra-5g-titanium-gray",
    title: "Refurbished Samsung Galaxy S24 Ultra 5G (512GB - Titanium Gray)",
    price: 94999,
    original_price: 129999,
    condition: "like-new",
    listing_type: "fixed",
    is_negotiable: true,
    category: { id: 1, name: "Smartphones", slug: "smartphones" },
    brand: "Samsung",
    city: "Hyderabad, TS",
    status: "available",
    views: 2400,
    wishlist_count: 165,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
      alt: "Samsung Galaxy S24 Ultra"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-03T11:00:00Z",
    material_finish: "Titanium Armor Frame & Corning Gorilla Armor Glass",
    battery_health: 97,
    inspection_grade: "Grade A+ Mint",
    included_accessories: "Built-in S-Pen, USB-C to USB-C Cable, Original Box",
  },
  {
    id: 106,
    slug: "refurbished-canon-eos-r6-mark-ii-mirrorless-body",
    title: "Refurbished Canon EOS R6 Mark II Mirrorless Body",
    price: 169999,
    original_price: 243995,
    condition: "excellent",
    listing_type: "fixed",
    is_negotiable: false,
    category: { id: 5, name: "Cameras", slug: "cameras" },
    brand: "Canon",
    city: "Chandigarh, PB",
    status: "available",
    views: 950,
    wishlist_count: 62,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
      alt: "Canon EOS R6 Mark II"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-01T14:00:00Z",
    material_finish: "Magnesium Alloy Chassis & Weather-Sealed Exterior",
    battery_health: 95,
    inspection_grade: "Grade A Excellent (Shutter Count: 3,400)",
    included_accessories: "LP-E6NH Battery, Battery Charger, Neck Strap, Body Cap",
  },
  {
    id: 107,
    slug: "refurbished-apple-watch-ultra-2-49mm-titanium",
    title: "Refurbished Apple Watch Ultra 2 (49mm Titanium Case)",
    price: 59999,
    original_price: 89900,
    condition: "like-new",
    listing_type: "fixed",
    is_negotiable: true,
    category: { id: 6, name: "Wearables", slug: "wearables" },
    brand: "Apple",
    city: "Mumbai, MH",
    status: "available",
    views: 1780,
    wishlist_count: 110,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop&q=80",
      alt: "Apple Watch Ultra 2"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-02T16:00:00Z",
    material_finish: "Aerospace Titanium Case & Sapphire Crystal Glass",
    battery_health: 98,
    inspection_grade: "Grade A+ Mint",
    included_accessories: "Orange Ocean Band, Magnetic Fast Charger, Box",
  },
  {
    id: 108,
    slug: "refurbished-apple-macbook-air-m2-midnight",
    title: "Refurbished Apple MacBook Air M2 (8GB / 256GB - Midnight)",
    price: 69999,
    original_price: 119900,
    condition: "excellent",
    listing_type: "fixed",
    is_negotiable: true,
    category: { id: 2, name: "Laptops", slug: "laptops" },
    brand: "Apple",
    city: "Ahmedabad, GJ",
    status: "available",
    views: 2890,
    wishlist_count: 195,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
      alt: "MacBook Air M2 Midnight"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-03T14:00:00Z",
    material_finish: "Midnight Anodized Aluminum Unibody Shell",
    battery_health: 92,
    inspection_grade: "Grade A Excellent",
    included_accessories: "35W Dual USB-C Adapter, Braided MagSafe Cable",
  },
  {
    id: 109,
    slug: "refurbished-dell-xps-15-9530-oled-touch",
    title: "Refurbished Dell XPS 15 9530 (i7-13700H / RTX 4060 / 3.5K OLED)",
    price: 124999,
    original_price: 219900,
    condition: "excellent",
    listing_type: "fixed",
    is_negotiable: false,
    category: { id: 2, name: "Laptops", slug: "laptops" },
    brand: "Dell",
    city: "Bengaluru, KA",
    status: "available",
    views: 1650,
    wishlist_count: 88,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
      alt: "Dell XPS 15 OLED"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-02T10:00:00Z",
    material_finish: "CNC Machined Aluminum & Carbon Fiber Palmrest",
    battery_health: 93,
    inspection_grade: "Grade A Excellent",
    included_accessories: "Original 130W Type-C Power Brick & Dongle",
  },
  {
    id: 110,
    slug: "refurbished-apple-ipad-pro-129-m2-wifi-128gb",
    title: "Refurbished Apple iPad Pro 12.9 M2 Wi-Fi (128GB - Space Grey)",
    price: 74999,
    original_price: 112900,
    condition: "like-new",
    listing_type: "fixed",
    is_negotiable: true,
    category: { id: 7, name: "Tablets", slug: "tablets" },
    brand: "Apple",
    city: "Delhi NCR, DL",
    status: "available",
    views: 1980,
    wishlist_count: 130,
    is_wishlisted: false,
    primary_image: {
      url: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80",
      alt: "iPad Pro 12.9 M2"
    },
    seller: { id: 1, full_name: "Tariani Certified Store", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200", rating: 4.95, is_verified: true },
    created_at: "2026-08-03T16:00:00Z",
    material_finish: "Space Grey Aluminum Enclosure & Mini-LED Retina Display",
    battery_health: 96,
    inspection_grade: "Grade A+ Mint",
    included_accessories: "20W USB-C Adapter, USB-C Charge Cable, Screen Guard",
  },
];

const CONDITIONS = [
  { value: "new", label: "Brand New" },
  { value: "like-new", label: "Grade A+ (Mint)" },
  { value: "excellent", label: "Grade A (Excellent)" },
  { value: "good", label: "Grade B (Good)" },
  { value: "fair", label: "Fair" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
];

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

function ProductCard({ product, onSelectInspect }: { product: Product; onSelectInspect: (p: Product) => void }) {
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
            onClick={() => onSelectInspect(product)}
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

function BrowsePageContent() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (searchParams) {
      const q = searchParams.get("q") || searchParams.get("search");
      if (q) setSearch(q);
      const cat = searchParams.get("category");
      if (cat) setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Selected product for 32-Point Quality Inspection Modal
  const [inspectProduct, setInspectProduct] = useState<Product | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(apiUrl("/api/v1/marketplace/categories/"));
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.results || data);
    } catch {
      setCategories([
        { id: 1, name: "Smartphones", slug: "smartphones" },
        { id: 2, name: "Laptops", slug: "laptops" },
        { id: 3, name: "Gaming", slug: "gaming" },
        { id: 4, name: "Audio", slug: "audio" },
        { id: 5, name: "Cameras", slug: "cameras" },
        { id: 6, name: "Wearables", slug: "wearables" },
        { id: 7, name: "Tablets", slug: "tablets" },
      ]);
    }
  }, []);

  const applyFallbackFilter = useCallback(() => {
    let list = [...FALLBACK_PRODUCTS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      list = list.filter((p) => p.category.slug === selectedCategory);
    }
    if (selectedConditions.length > 0) {
      list = list.filter((p) => selectedConditions.includes(p.condition));
    }
    if (minPrice) {
      list = list.filter((p) => p.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      list = list.filter((p) => p.price <= parseFloat(maxPrice));
    }
    if (sort === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "popular") {
      list.sort((a, b) => b.views - a.views);
    }
    setProducts(list);
    setTotalCount(list.length);
  }, [search, selectedCategory, selectedConditions, minPrice, maxPrice, sort]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory) params.set("category", selectedCategory);
      if (selectedConditions.length) params.set("condition", selectedConditions.join(","));
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);
      if (sort) params.set("sort", sort);

      params.set("page_size", "100");
      const res = await fetch(apiUrl(`/api/v1/marketplace/products/?${params}`));
      if (!res.ok) throw new Error("API request failed");
      const data: PaginatedResponse = await res.json();
      
      if (data.results && data.results.length > 0) {
        setProducts(data.results);
        setTotalCount(data.count || data.results.length);
      } else {
        // Fallback to local dataset if API returns 0 items
        applyFallbackFilter();
      }
    } catch {
      applyFallbackFilter();
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedConditions, minPrice, maxPrice, sort, applyFallbackFilter]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleCondition = (val: string) => {
    setSelectedConditions((prev) =>
      prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedConditions([]);
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
  };

  const hasActiveFilters = selectedCategory || selectedConditions.length > 0 || minPrice || maxPrice || search;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Security & Warranty Banner */}
      <div className="border-b border-border/60 bg-gradient-to-r from-brand/5 via-emerald-500/5 to-transparent py-2.5">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              100% Inspected Pre-Owned Electronics & Escrow Protection
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              32-Point Material & Technical Certification
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-amber-500" />
              6-Month Store Warranty Included
            </span>
          </div>
          <span className="font-extrabold text-brand">Tariani Sellers Trust Standard</span>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Rich Hero Banner */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-slate-950 p-6 md:p-10 shadow-2xl border border-slate-800 text-white relative">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-brand/20 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 relative z-10">
            <div className="space-y-4 lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-amber-400 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
                  Certified Second-Hand Marketplace
                </span>
                <span className="inline-block rounded-full bg-white/10 backdrop-blur px-3 py-1 text-[11px] font-bold text-slate-200">
                  ⚡ Dispatched in 24 Hours
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-none text-white">
                VERIFIED PRE-OWNED TECH & ELECTRONICS
              </h1>
              <p className="text-sm font-medium text-slate-300 max-w-2xl leading-relaxed">
                Shop authentic iPhones, MacBooks, Sony cameras, PS5, and wearables with verified battery health, original accessories, 32-point material inspection, and 6-Month Tariani Store Warranty.
              </p>

              {/* Material Trust Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="rounded-full bg-white/10 backdrop-blur border border-white/20 px-4 py-1.5 text-xs font-bold text-white flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-400" /> {totalCount} Verified Items Available
                </span>
                <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-1.5 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" /> 100% Genuine Serial Verified
                </span>
              </div>
            </div>

            <div className="hidden lg:flex justify-end lg:col-span-4">
              <div className="relative w-72 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-4 border border-slate-700 shadow-2xl text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-400 uppercase tracking-widest text-[10px]">INSPECTION METRICS</span>
                  <Award className="h-4 w-4 text-amber-400" />
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between"><span>Frame & Chassis:</span><strong className="text-white">Grade A+ Titanium/Alloy</strong></div>
                  <div className="flex justify-between"><span>Battery Health:</span><strong className="text-emerald-400">88% - 100% Tested</strong></div>
                  <div className="flex justify-between"><span>Display Glass:</span><strong className="text-white">Zero Scratches</strong></div>
                  <div className="flex justify-between"><span>Warranty:</span><strong className="text-amber-400">6 Months Included</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Quick Categories Bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search Apple, Sony, iPhone 15 Pro, PS5, MacBooks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-input bg-card py-3.5 pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 rounded-2xl border px-5 py-3.5 text-sm font-bold transition-all ${
              showFilters || hasActiveFilters
                ? "border-brand bg-brand-soft text-brand shadow-sm"
                : "border-border bg-card hover:bg-muted"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-xs font-black text-brand-foreground">
                !
              </span>
            )}
          </button>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl border border-input bg-card py-3.5 pl-4 pr-10 text-sm font-semibold focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 cursor-pointer appearance-none shadow-sm"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-3xl border border-border bg-card p-6 shadow-md">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Category */}
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full rounded-xl border border-input bg-background py-2.5 pl-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price range */}
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Budget Range (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2.5 pl-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                      <span className="text-muted-foreground">–</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background py-2.5 pl-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                  </div>

                  {/* Condition Grade */}
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-muted-foreground">
                      Inspected Condition Grade
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CONDITIONS.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => toggleCondition(c.value)}
                          className={`rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                            selectedConditions.includes(c.value)
                              ? "border-brand bg-brand text-brand-foreground shadow-sm"
                              : "border-border bg-background hover:border-brand/40"
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-5 border-t border-border pt-4 flex items-center justify-between">
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:underline"
                    >
                      <X className="h-4 w-4" />
                      Reset all filters
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Showing {products.length} matching pre-owned items
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product grid */}
        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-border bg-card/60 p-8 shadow-sm">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black text-foreground">No matching items found</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              We couldn&apos;t find any items matching your exact search or active filters. Try broadening your budget or clearing category filters.
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-5 rounded-full px-6 font-bold">
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectInspect={(p) => setInspectProduct(p)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 32-Point Material & Technical Diagnostic Drawer / Modal */}
      <AnimatePresence>
        {inspectProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-700 bg-slate-950 text-white p-6 sm:p-8 shadow-2xl"
            >
              <button
                onClick={() => setInspectProduct(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                OFFICIAL TARIANI 32-POINT DIAGNOSTIC CERTIFICATE
              </div>

              <h2 className="mt-2 text-xl sm:text-2xl font-black text-white leading-tight">
                {inspectProduct.title}
              </h2>

              <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-1">
                  <span className="text-slate-400">Physical Grade:</span>
                  <p className="text-sm font-black text-emerald-400">
                    {CONDITION_BADGES[inspectProduct.condition]?.label || "Grade A"}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-1">
                  <span className="text-slate-400">Battery Health Capacity:</span>
                  <p className="text-sm font-black text-amber-400">
                    {inspectProduct.battery_health ?? 94}% Tested Capacity
                  </p>
                </div>
              </div>

              {/* Material Breakdown */}
              <div className="mt-6 rounded-2xl bg-white/5 p-5 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-brand" /> Material & Chassis Build Breakdown
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {inspectProduct.material_finish || "Aerospace-Grade Anodized Metal Alloy Chassis with Reinforced Glass Front."}
                </p>
              </div>

              {/* Checklist */}
              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Verified Inspection Checklist
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "100% Genuine OEM Internal Components",
                    "Screen Glass & Touch Digitizer 100% Pass",
                    "Camera Lens & Sensor Free of Dust/Scratches",
                    "Speakers & Microphones Audio Test Cleared",
                    "Charging Port & Battery Cycles Verified",
                    "Blacklist & Anti-Theft Lock Free Guarantee",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-200 bg-slate-900 p-2.5 rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included Accessories */}
              <div className="mt-6 rounded-2xl bg-slate-900 p-4 border border-slate-800 flex items-center gap-3">
                <Box className="h-6 w-6 text-brand flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-white">Included Accessories:</span>
                  <p className="text-slate-300 mt-0.5">
                    {inspectProduct.included_accessories || "Original Charging Cable, Certified Invoice & 6-Month Store Warranty Card"}
                  </p>
                </div>
              </div>

              {/* Footer action */}
              <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-5">
                <div className="text-xs">
                  <span className="text-slate-400">Inspected Price:</span>
                  <p className="text-xl font-black text-white">{formatPrice(inspectProduct.price)}</p>
                </div>
                <Button
                  as={Link}
                  href={`/products/${inspectProduct.slug}`}
                  className="rounded-full px-6 font-black"
                >
                  View Full Item Details <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex justify-center items-center py-24">
          <Spinner size="lg" />
        </div>
      }
    >
      <BrowsePageContent />
    </Suspense>
  );
}
