"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package, PlusCircle, Star, Eye, Heart, BadgeCheck, Tag, BarChart3,
  ShoppingBag, Wallet, LogOut, Edit
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/config/env";
import { tokenStorage } from "@/services/http";

interface ProductImage { url: string; alt: string; }
interface Category { name: string; }
interface Listing {
  id: number;
  slug: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  views: number;
  wishlist_count: number;
  primary_image: ProductImage | null;
  category: Category;
  created_at: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-success/15 text-success",
  reserved: "bg-accent/15 text-accent-foreground",
  sold: "bg-muted text-muted-foreground",
  hidden: "bg-border text-muted-foreground",
};

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
    if (!authLoading && isAuthenticated && user?.role !== "seller") router.push("/dashboard");
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = tokenStorage.getAccess();
    fetch(apiUrl("/api/v1/marketplace/my-listings/"), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setListings(data.results || data))
      .catch(() => setListings([]))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-32"><Spinner size="lg" /></div>
      </div>
    );
  }

  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const totalWishlisted = listings.reduce((sum, l) => sum + l.wishlist_count, 0);
  const activeListings = listings.filter((l) => l.status === "available").length;
  const soldListings = listings.filter((l) => l.status === "sold").length;

  const stats = [
    { label: "Active Listings", value: activeListings, icon: Package, color: "text-brand" },
    { label: "Total Views", value: totalViews, icon: Eye, color: "text-accent-foreground" },
    { label: "Wishlisted", value: totalWishlisted, icon: Heart, color: "text-danger" },
    { label: "Sold", value: soldListings, icon: ShoppingBag, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container-page py-10">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Seller Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.firstName}!
              {user.isEmailVerified && (
                <span className="ml-2 inline-flex items-center gap-1 text-success">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified Seller
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />} as={Link} href="/sell">
              New Listing
            </Button>
            <Button variant="outline" size="sm" leftIcon={<LogOut className="h-4 w-4" />} onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-2 text-2xl font-extrabold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Seller profile card */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-5 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-foreground text-xl font-bold flex-shrink-0">
            {user.firstName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold">{user.firstName} {user.lastName}</h2>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-accent text-accent" />
                {user.rating}
              </div>
              <p className="text-xs text-muted-foreground">{user.reviewCount} reviews</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">{user.completedOrders}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My Listings</h2>
            <Button variant="outline" size="sm" leftIcon={<PlusCircle className="h-4 w-4" />} as={Link} href="/sell">
              Add Listing
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center rounded-2xl border border-dashed border-border">
              <Tag className="mb-4 h-12 w-12 text-muted-foreground/30" />
              <h3 className="font-semibold">No listings yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Create your first listing to start selling.</p>
              <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />} as={Link} href="/sell" className="mt-4">
                Create First Listing
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:shadow-soft transition-shadow"
                >
                  {/* Image */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {listing.primary_image ? (
                      <img src={listing.primary_image.url} alt={listing.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center"><Tag className="h-6 w-6 text-muted-foreground/30" /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${listing.slug}`} className="font-semibold text-sm hover:text-brand line-clamp-1">
                      {listing.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{listing.category?.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{formatPrice(listing.price)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[listing.status]}`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{listing.views}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{listing.wishlist_count}</span>
                  </div>

                  {/* Actions */}
                  <Link
                    href={`/products/${listing.slug}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
