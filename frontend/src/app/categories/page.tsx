"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Tag, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Spinner } from "@/components/ui/Spinner";
import { apiUrl } from "@/config/env";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  product_count: number;
}

const CATEGORY_STUDIO_IMAGES: Record<string, string> = {
  smartphones: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
  laptops: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
  gaming: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80",
  audio: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
  wearables: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  cameras: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
  tablets: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
  appliances: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(apiUrl("/api/v1/marketplace/categories/"));
        const data = await res.json();
        setCategories(data.results || data);
      } catch {
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container-page py-8">
        {/* Categories Hero Banner with Laptop Shopping Illustration */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 overflow-hidden rounded-3xl bg-amber-400 p-6 md:p-8 shadow-lg border border-amber-500/50"
        >
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Tariani Sellers Verified Categories</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-slate-950 leading-tight">
                Explore Tech & Electronics
              </h1>
              <p className="text-sm font-semibold text-slate-900 max-w-xl leading-relaxed">
                Find certified pre-owned smartphones, laptops, audio gear & gaming consoles. Passed 32-point technical evaluation with 6-Month Warranty.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span className="rounded-full bg-white px-4 py-1.5 text-xs font-black text-slate-900 shadow-sm">
                  100% Inspected & Tested
                </span>
                <span className="rounded-full bg-slate-950 px-4 py-1.5 text-xs font-bold text-amber-300">
                  Escrow Payment Guarantee
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-5">
              <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-2 shadow-2xl border-2 border-slate-950 transform hover:scale-105 transition-transform duration-300">
                <img
                  src="/categories_hero_banner.jpg"
                  alt="Tariani Sellers Categories Online Storefront Showcase"
                  className="h-auto w-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Spinner size="lg" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <Tag className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold">No categories yet</h3>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, idx) => {
              const bgImg = CATEGORY_STUDIO_IMAGES[category.slug] || CATEGORY_STUDIO_IMAGES.smartphones;

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <Link
                    href={`/browse?category=${category.slug}`}
                    className="group relative block overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-brand/40"
                  >
                    {/* Studio Device Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <img
                        src={bgImg}
                        alt={category.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h2 className="text-base font-extrabold text-foreground group-hover:text-brand transition-colors">
                        {category.name}
                      </h2>
                      <p className="mt-1 text-xs font-semibold text-muted-foreground">
                        {category.product_count > 0
                          ? `${category.product_count} Verified Listing${category.product_count !== 1 ? "s" : ""}`
                          : "Explore Listings"}
                      </p>

                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-brand group-hover:underline">
                        Browse Category <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
