"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart, Package, User, Settings, Star, BadgeCheck, MapPin, Tag, LogOut
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/config/env";
import { tokenStorage } from "@/services/http";

interface ProductImage { url: string; alt: string; }
interface Product {
  id: number;
  slug: string;
  title: string;
  price: number;
  condition: string;
  primary_image: ProductImage | null;
  city: string | null;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

type Tab = "profile" | "wishlist" | "orders";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "orders", label: "Orders", icon: Package },
];

function DashboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get("tab") as Tab;
      if (tab) setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (activeTab === "wishlist" && isAuthenticated) {
      setWishlistLoading(true);
      const token = tokenStorage.getAccess();
      fetch(apiUrl("/api/v1/marketplace/wishlist/"), {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setWishlist(data.results || data))
        .catch(() => setWishlist([]))
        .finally(() => setWishlistLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-32">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-page py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">My Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user.firstName}!</p>
          </div>
          <Button variant="outline" size="sm" leftIcon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* User card */}
            <div className="mb-4 rounded-2xl border border-border bg-card p-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand text-brand-foreground text-2xl font-bold">
                {user.firstName?.charAt(0)?.toUpperCase()}
              </div>
              <h2 className="mt-3 font-semibold text-foreground">{user.firstName} {user.lastName}</h2>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              <div className="mt-2 flex items-center justify-center gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                  user.role === "seller" ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"
                }`}>
                  {user.role}
                </span>
                {user.isEmailVerified && (
                  <BadgeCheck className="h-4 w-4 text-success" />
                )}
              </div>
              {user.role === "seller" && (
                <div className="mt-3 flex items-center justify-center gap-1 text-sm">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="font-medium">{user.rating}</span>
                  <span className="text-muted-foreground">({user.reviewCount})</span>
                </div>
              )}
            </div>

            {/* Nav tabs */}
            <nav className="space-y-1">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === key
                      ? "bg-brand-soft text-brand"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
              {user.role === "seller" && (
                <Link
                  href="/seller/dashboard"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                  Seller Dashboard
                </Link>
              )}
            </nav>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">
            {activeTab === "profile" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
                <dl className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "First Name", value: user.firstName },
                    { label: "Last Name", value: user.lastName || "—" },
                    { label: "Email", value: user.email },
                    { label: "Phone", value: user.phone || "—" },
                    { label: "Role", value: user.role, badge: true },
                    { label: "Email Verified", value: user.isEmailVerified ? "Yes" : "No" },
                    { label: "Orders Completed", value: String(user.completedOrders) },
                    { label: "Member Since", value: new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" }) },
                  ].map(({ label, value, badge }) => (
                    <div key={label} className="rounded-xl bg-muted/50 p-4">
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</dt>
                      <dd className="text-sm font-semibold text-foreground capitalize">{value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    To update your profile, contact support at support@reloqa.app.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-lg font-semibold mb-4">My Wishlist</h2>
                {wishlistLoading ? (
                  <div className="flex justify-center py-16"><Spinner size="lg" /></div>
                ) : wishlist.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-center">
                    <Heart className="mb-4 h-12 w-12 text-muted-foreground/30" />
                    <h3 className="font-semibold">Your wishlist is empty</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Start browsing and save items you love.</p>
                    <Button variant="outline" size="sm" as={Link} href="/browse" className="mt-4">Browse Products</Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((product) => (
                      <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                        <div className="rounded-2xl border border-border bg-card overflow-hidden hover:shadow-card transition-all duration-300 group-hover:-translate-y-1">
                          <div className="aspect-[4/3] bg-muted relative">
                            {product.primary_image ? (
                              <img src={product.primary_image.url} alt={product.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="flex h-full items-center justify-center"><Tag className="h-10 w-10 text-muted-foreground/30" /></div>
                            )}
                          </div>
                          <div className="p-4">
                            <p className="text-sm font-semibold line-clamp-2">{product.title}</p>
                            <p className="mt-1 text-base font-extrabold text-brand">{formatPrice(product.price)}</p>
                            {product.city && (
                              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />{product.city}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-lg font-semibold mb-4">My Orders</h2>
                <div className="flex flex-col items-center py-16 text-center">
                  <Package className="mb-4 h-12 w-12 text-muted-foreground/30" />
                  <h3 className="font-semibold">No orders yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">When you place an order, it&apos;ll show up here.</p>
                  <Button variant="outline" size="sm" as={Link} href="/browse" className="mt-4">Start Shopping</Button>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex justify-center items-center py-24">
          <Spinner size="lg" />
        </div>
      }
    >
      <DashboardPageContent />
    </Suspense>
  );
}
