"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Package, Users, DollarSign, CheckCircle2, XCircle,
  Eye, Trash2, Search, SlidersHorizontal, RefreshCw, PlusCircle, ArrowUpRight,
  Database, AlertCircle, LayoutDashboard, Key, ShieldAlert
} from "lucide-react";
import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { apiUrl } from "@/config/env";
import { tokenStorage } from "@/services/http";

interface Product {
  id: number;
  slug: string;
  title: string;
  price: number;
  condition: string;
  status: string;
  views: number;
  brand: string | null;
  category: { name: string };
  seller: { full_name: string };
  created_at: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
}

export default function WebAdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl("/api/v1/marketplace/products/"));
      const data = await res.json();
      const items = data.results || data;
      setProducts(Array.isArray(items) ? items : []);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === "available" ? "hidden" : "available";
    const token = tokenStorage.getAccess();
    try {
      const res = await fetch(apiUrl(`/api/v1/marketplace/products/${product.slug}/`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setActionSuccess(`Updated status for "${product.title}" to ${nextStatus}`);
        fetchAdminData();
        setTimeout(() => setActionSuccess(""), 4000);
      }
    } catch { /* ignore */ }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this product from the database?")) return;
    const token = tokenStorage.getAccess();
    try {
      const res = await fetch(apiUrl(`/api/v1/marketplace/products/${slug}/`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok || res.status === 204) {
        setActionSuccess("Product deleted successfully.");
        fetchAdminData();
        setTimeout(() => setActionSuccess(""), 4000);
      }
    } catch { /* ignore */ }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = selectedStatus === "all" || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const activeCount = products.filter((p) => p.status === "available").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Admin Header Bar */}
      <div className="border-b border-border/60 bg-card py-6">
        <div className="container-page flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Web Admin Control Panel
              </span>
              <span className="text-xs text-muted-foreground">Database Access Active</span>
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground">Platform Database & Inventory Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAdminData} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Refresh Database
            </Button>
            <Button size="sm" as={Link} href="/sell" leftIcon={<PlusCircle className="h-3.5 w-3.5" />}>
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Success Alert */}
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>{actionSuccess}</span>
            </div>
          </motion.div>
        )}

        {/* System Overview Metrics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <span>Total Catalog Items</span>
              <Package className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{products.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">{activeCount} Active on Storefront</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <span>Inventory Valuation</span>
              <DollarSign className="h-4 w-4 text-brand" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-foreground">{formatPrice(totalValue)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Total Database Asset Value</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <span>Registered Users</span>
              <Users className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-2 text-3xl font-extrabold text-foreground">3 Accounts</p>
            <p className="mt-1 text-xs text-muted-foreground">Admin, Certified Seller, Buyer</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <span>Django Admin Portal</span>
              <Key className="h-4 w-4 text-blue-500" />
            </div>
            <a
              href="http://localhost:8000/django-admin/"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
            >
              Open Django Backend Admin <ArrowUpRight className="h-4 w-4" />
            </a>
            <p className="mt-1 text-xs text-muted-foreground">Raw DB Access & Tables</p>
          </div>
        </div>

        {/* Inventory Control Table */}
        <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
          <div className="border-b border-border p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-60">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products in database..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div className="flex items-center gap-2">
              {["all", "available", "hidden"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-xl px-3 py-2 text-xs font-semibold capitalize transition-all ${
                    selectedStatus === status
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">
              No products found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase font-semibold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-3.5">Product Title</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Seller</th>
                    <th className="px-6 py-3.5 text-right">Database Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground max-w-xs truncate">
                        {p.title}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.category?.name || "General"}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {formatPrice(p.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          p.status === "available" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/15 text-rose-500"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {p.seller?.full_name || "Store Account"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p.slug}`}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="View on Storefront"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(p)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title={p.status === "available" ? "Hide from Storefront" : "Make Available"}
                          >
                            {p.status === "available" ? <XCircle className="h-4 w-4 text-amber-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          </button>
                          <button
                            onClick={() => handleDelete(p.slug)}
                            className="rounded-lg p-2 text-rose-500 hover:bg-rose-500/10"
                            title="Delete from Database"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
