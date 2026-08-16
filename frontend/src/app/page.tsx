"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Zap,
  Lock,
  ChevronRight,
  ChevronLeft,
  Flame,
  Truck,
  RotateCcw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Film,
  Image as ImageIcon,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { FlashSaleCountdown } from "@/components/common/FlashSaleCountdown";
import { MarqueeBanner } from "@/components/common/MarqueeBanner";
import { ProductCard, type Product } from "@/components/common/ProductCard";
import { apiUrl } from "@/config/env";

// Official Nike.com Style Brand Icons
const BRAND_TILES = [
  { name: "APPLE", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/apple.svg", query: "Apple" },
  { name: "SAMSUNG", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/samsung.svg", query: "Samsung" },
  { name: "SONY", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/sony.svg", query: "Sony" },
  { name: "DELL", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/dell.svg", query: "Dell" },
  { name: "ASUS", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/asus.svg", query: "Asus" },
  { name: "CANON", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v10/icons/canon.svg", query: "Canon" },
];

const FEATURED_CATEGORIES = [
  {
    title: "SMARTPHONES",
    subtitle: "Certified iPhones & Galaxy Flagships",
    categorySlug: "smartphones",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
    tag: "JUST IN",
  },
  {
    title: "MACBOOKS & LAPTOPS",
    subtitle: "Apple M-Series & Gaming Rigs",
    categorySlug: "laptops",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
    tag: "BESTSELLERS",
  },
  {
    title: "GAMING CONSOLES",
    subtitle: "PS5, Xbox Series X & ROG Ally",
    categorySlug: "gaming",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    tag: "TRENDING",
  },
  {
    title: "AUDIO & SOUND",
    subtitle: "Sony XM5, Marshall & Bose",
    categorySlug: "audio",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    tag: "ESSENTIALS",
  },
  {
    title: "SMARTWATCHES",
    subtitle: "Apple Watch Ultra & Galaxy Watch",
    categorySlug: "wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    tag: "FITNESS",
  },
  {
    title: "CAMERAS & GEAR",
    subtitle: "Sony Alpha, Canon & Fujifilm",
    categorySlug: "cameras",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
    tag: "PRO GEAR",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0); // 0: Video, 1: Photo
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);

  const [recentUploads, setRecentUploads] = useState<Product[]>([]);

  useEffect(() => {
    fetch(apiUrl("/api/v1/marketplace/products/?page_size=4&ordering=-created_at"))
      .then((res) => res.json())
      .then((data) => {
        if (data.results) setRecentUploads(data.results);
      })
      .catch((err) => console.error("Error fetching recent uploads", err));
  }, []);

  // Play/pause video whenever slide or muted state changes
  useEffect(() => {
    if (currentSlide === 0 && videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.defaultMuted = true;
      videoRef.current.playsInline = true;
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentSlide, isPlaying, isMuted]);

  // Handle Photo slide duration (6 seconds then return to video slide)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentSlide === 1) {
      timer = setTimeout(() => {
        setCurrentSlide(0);
        setIsPlaying(true);
      }, 6000);
    }
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const handleVideoEnded = () => {
    setCurrentSlide(1);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide !== 0) {
      setCurrentSlide(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-black selection:text-white">
      {/* Top Nike-Style Announcement Bar */}
      <div className="bg-slate-950 py-2.5 text-white text-[11px] font-bold tracking-widest uppercase">
        <div className="container-page flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Flame className="h-3.5 w-3.5 fill-amber-400" />
              SINGH SELLERS MEGA FLASH SALE
            </span>
            <span className="hidden sm:inline opacity-30">|</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <Truck className="h-3.5 w-3.5" /> FREE EXPRESS DELIVERY ACROSS INDIA
            </span>
          </div>
          <span>USE CODE <strong className="bg-white text-black px-1.5 py-0.5 rounded font-mono">SINGH10</strong> FOR 10% OFF</span>
        </div>
      </div>

      <Navbar />

      {/* Nike Official Style Widescreen Hero Loop Carousel with Interactive Media Player Controls */}
      <section className="relative w-full bg-black overflow-hidden group">
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {currentSlide === 0 ? (
              /* SLIDE 1: VIDEO */
              <motion.div
                key="slide-video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="h-full w-full relative"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  muted={isMuted}
                  playsInline
                  onEnded={handleVideoEnded}
                  className="h-full w-full object-cover opacity-85"
                >
                  <source src="/homepage_video.mp4" type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
              </motion.div>
            ) : (
              /* SLIDE 2: ATTACHED PHOTO */
              <motion.div
                key="slide-photo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="h-full w-full relative"
              >
                <img
                  src="/hero_banner_2.jpg"
                  alt="Singh Sellers 100% Recycled Packaging & Quality Inspection"
                  className="h-full w-full object-cover opacity-90"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 pointer-events-none" />
        </div>



        {/* MEDIA CONTROLS FLOATING BAR (Play/Pause, Sound Toggle, Fullscreen View) */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
          {currentSlide === 0 && (
            <>
              <button
                onClick={togglePlay}
                className="flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition-all shadow-lg"
                title={isPlaying ? "Pause Video" : "Play Video"}
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                <span>{isPlaying ? "Pause" : "Play"}</span>
              </button>

              <button
                onClick={toggleMute}
                className="flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:bg-black transition-all shadow-lg"
                title={isMuted ? "Unmute Sound" : "Mute Sound"}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
                <span>{isMuted ? "Unmute" : "Sound On"}</span>
              </button>
            </>
          )}

          <button
            onClick={() => setMediaModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-white text-black px-3.5 py-1.5 text-xs font-black uppercase tracking-wider hover:bg-amber-400 transition-all shadow-xl"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Full Viewer</span>
          </button>
        </div>

        {/* Nike Style Bold Typography Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-14 lg:p-20 text-white pointer-events-none">
          <div className="max-w-3xl space-y-3 pointer-events-auto">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-white px-3.5 py-1 text-[10px] font-black tracking-widest text-black uppercase">
                {currentSlide === 0 ? "FEATURED VIDEO EXPERIENCE · SINGH SELLERS" : "100% RECYCLED PACKAGING & 32-PT INSPECTION"}
              </span>
              <span className="rounded-full bg-amber-400 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
                {currentSlide === 0 ? "HD VIDEO" : "HIGH-RES PHOTO"}
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-none text-white drop-shadow-md">
              {currentSlide === 0 ? "REDEFINE YOUR TECH" : "SUSTAINABLE & CERTIFIED"}
            </h1>

            <p className="text-sm sm:text-lg font-medium text-slate-200 max-w-xl leading-relaxed opacity-90">
              {currentSlide === 0
                ? "Pre-owned iPhones, MacBooks, and gaming consoles. Passed 32-point technical evaluation with 6-month Singh Sellers Warranty."
                : "Every device is professionally sanitized, packed in 100% eco-friendly recycled packaging, and delivered with warranty documentation."}
            </p>

            {/* Nike Style Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link
                href="/browse"
                className="rounded-full bg-white px-8 py-3.5 text-xs font-black uppercase tracking-widest text-black hover:bg-slate-200 transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                Shop Now
              </Link>
              <Link
                href="/categories"
                className="rounded-full border-2 border-white px-8 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all shadow-lg hover:scale-105 active:scale-95"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Manual Slide Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((v) => (v === 0 ? 1 : 0))}
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur border border-white/20 hover:bg-black transition-all opacity-0 group-hover:opacity-100"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentSlide((v) => (v === 0 ? 1 : 0))}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur border border-white/20 hover:bg-black transition-all opacity-0 group-hover:opacity-100"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide Indicator Dots & Mode Switcher */}
        <div className="absolute bottom-4 right-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
          <button
            onClick={() => setCurrentSlide(0)}
            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-all px-2 py-0.5 rounded-full ${
              currentSlide === 0 ? "bg-white text-black" : "text-slate-300 hover:text-white"
            }`}
          >
            <Film className="h-3 w-3" /> Video
          </button>
          <button
            onClick={() => setCurrentSlide(1)}
            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider transition-all px-2 py-0.5 rounded-full ${
              currentSlide === 1 ? "bg-white text-black" : "text-slate-300 hover:text-white"
            }`}
          >
            <ImageIcon className="h-3 w-3" /> Photo
          </button>
        </div>
      </section>

      {/* FULL-SCREEN HIGH RESOLUTION MEDIA VIEWER LIGHTBOX MODAL */}
      <AnimatePresence>
        {mediaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white flex flex-col justify-between shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-amber-400 text-black px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                    Singh Sellers Official Media
                  </span>
                  <h3 className="text-sm font-bold text-white">
                    {currentSlide === 0 ? "Homepage Storefront Video Experience" : "100% Recycled Packaging & Quality Inspection Photo"}
                  </h3>
                </div>
                <button
                  onClick={() => setMediaModalOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body: High Resolution Media */}
              <div className="relative flex-1 bg-black flex items-center justify-center min-h-[400px]">
                {currentSlide === 0 ? (
                  <video
                    ref={modalVideoRef}
                    autoPlay
                    controls
                    playsInline
                    className="max-h-[70vh] w-full object-contain"
                  >
                    <source src="/homepage_video.mp4" type="video/mp4" />
                  </video>
                ) : (
                  <img
                    src="/hero_banner_2.jpg"
                    alt="Singh Sellers High Resolution Packaging Photo"
                    className="max-h-[70vh] w-full object-contain"
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex flex-wrap items-center justify-between p-4 border-t border-slate-800 bg-slate-900/80 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentSlide((v) => (v === 0 ? 1 : 0))}
                    className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 font-bold text-white flex items-center gap-1.5 transition-all"
                  >
                    Switch to {currentSlide === 0 ? "Photo View" : "Video Experience"}
                  </button>
                </div>
                <button
                  onClick={() => setMediaModalOpen(false)}
                  className="rounded-full bg-white px-6 py-2 text-xs font-black uppercase tracking-wider text-black hover:bg-slate-200 transition-all"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flash Sale Bar */}
      <section className="border-b border-slate-200 bg-white py-8">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-rose-600">LIMITED TIME DEALS</span>
              <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-0.5">
                DEAL OF THE DAY
              </h2>
            </div>
            <FlashSaleCountdown />
          </div>
          <MarqueeBanner />

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=300&auto=format&fit=crop&q=80"
                alt="MacBook Air M1"
                className="h-20 w-24 object-cover rounded-2xl border border-slate-200"
              />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded">SAVE ₹44,901</span>
                <h3 className="text-base font-black uppercase text-black mt-1">MacBook Air M1 (Space Grey)</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-black text-black">₹54,999</span>
                  <span className="text-xs text-slate-400 line-through">₹99,900</span>
                </div>
              </div>
            </div>

            <Link
              href="/products/refurbished-apple-macbook-air-m1-8gb-256gb-space-grey"
              className="rounded-full bg-black px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 transition-all"
            >
              Claim Deal
            </Link>
          </div>
        </div>
      </section>

      {/* Official Top Brands Grid */}
      <section className="border-b border-slate-200 bg-white py-12">
        <div className="container-page">
          <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-8">
            FEATURED BRANDS
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
            {BRAND_TILES.map((brand) => (
              <button
                key={brand.name}
                onClick={() => router.push(`/browse?search=${encodeURIComponent(brand.query)}`)}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-black hover:shadow-lg hover:-translate-y-1"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-7 w-7 object-contain opacity-90"
                />
                <span className="mt-3 text-[11px] font-black uppercase tracking-wider text-black">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Nike Style Featured Category Grid */}
      <section className="bg-slate-900 py-16 dark:bg-background border-y border-white/5">
        <div className="container-page">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-brand">Explore Categories</span>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                Trending Pre-Owned
              </h2>
            </div>
            <Link
              href="/categories"
              className="group flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-white hover:text-black"
            >
              All Categories
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_CATEGORIES.map((cat, idx) => (
              <Link key={cat.title} href={`/browse?category=${cat.categorySlug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative overflow-hidden rounded-3xl aspect-[4/3] bg-slate-950 border border-white/10 shadow-2xl transition-all duration-300"
                >
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-100"
                  />
                  {/* Premium Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                  
                  {/* Subtle Top Glare */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="mb-2 w-max rounded-full bg-brand px-3 py-1 text-[10px] font-black tracking-widest text-brand-foreground shadow-lg backdrop-blur-md">
                      {cat.tag}
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-brand transition-colors">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-300">{cat.subtitle}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent User Uploads Section */}
      {recentUploads.length > 0 && (
        <section className="border-t border-slate-200 bg-slate-50 py-16 dark:bg-slate-900 dark:border-slate-800">
          <div className="container-page">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-brand">Newly Listed</span>
                <h2 className="mt-2 text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Sell Uploaded Items
                </h2>
                <p className="mt-1 text-sm text-slate-500 font-medium">
                  Latest 2nd hand electronics uploaded by our verified community
                </p>
              </div>
              <Link
                href="/browse"
                className="hidden items-center gap-1.5 text-sm font-bold text-brand hover:underline sm:flex"
              >
                View all uploads <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentUploads.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/browse"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-200 px-6 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-300 dark:bg-slate-800 dark:text-white"
              >
                View all uploads <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* We Deliver Across India — Map Section */}
      <section className="bg-[#0b132b] py-16 text-white overflow-hidden border-t border-blue-900/30">
        <div className="container-page">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: Text & City Badges */}
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">NATIONWIDE COVERAGE</span>
                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mt-2 leading-tight">
                  WE DELIVER ACROSS ALL OF INDIA
                </h2>
                <p className="mt-3 text-sm text-gray-400 font-medium leading-relaxed max-w-lg">
                  From metros to tier-2 cities, Singh Sellers delivers certified pre-owned electronics to your doorstep with express shipping and real-time tracking.
                </p>
              </div>

              {/* City Badges */}
              <div className="flex flex-wrap gap-2">
                {[
                  "Mumbai", "Delhi NCR", "Bangalore", "Hyderabad", "Chennai",
                  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
                  "Chandigarh", "Kochi", "Indore", "Bhopal", "Goa",
                ].map((city) => (
                  <span
                    key={city}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30 transition-all cursor-default"
                  >
                    <MapPin className="h-3 w-3 text-amber-500" />
                    {city}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-black text-amber-400">500+</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Cities</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-black text-amber-400">28</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">States</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-2xl font-black text-amber-400">24h</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5">Dispatch</p>
                </div>
              </div>
            </div>

            {/* Right: India Map Image */}
            <div className="flex justify-center">
              <div className="relative max-w-md w-full">
                <img
                  src="/india_delivery_map.png"
                  alt="India delivery coverage map showing cities where Singh Sellers delivers"
                  className="w-full h-auto rounded-3xl border border-white/10 shadow-2xl"
                />
                {/* Glowing overlay effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-amber-500/10 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Features */}
      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="container-page grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "32-POINT INSPECTED", desc: "Certified by Singh Sellers tech experts" },
            { icon: RotateCcw, title: "6-MONTH WARRANTY", desc: "Free repair or replacement guarantee" },
            { icon: Truck, title: "EXPRESS SHIPPING", desc: "Dispatched within 24 hours" },
            { icon: Lock, title: "ESCROW SAFE", desc: "Payment released only after delivery" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-black text-white font-bold">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-black">{item.title}</h4>
                <p className="mt-1 text-xs text-slate-500 font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
