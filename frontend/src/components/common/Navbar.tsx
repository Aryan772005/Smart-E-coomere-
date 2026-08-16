"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Heart,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  ShoppingBag,
  MapPin,
  Search,
  Loader2,
  Navigation,
  Phone,
  Mail,
} from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/components/common/CartDrawer";
import { cn } from "@/utils/cn";
import { SidebarMenu } from "@/components/common/SidebarMenu";

const NAV_LINKS = [
  { href: "/browse", label: "Browse" },
  { href: "/categories", label: "Categories" },
  { href: "/sell", label: "Sell" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { openCart, itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Location state
  const [locationCity, setLocationCity] = useState("Detecting...");
  const [locationPincode, setLocationPincode] = useState("");
  const [isLocating, setIsLocating] = useState(true);
  const [editingLocation, setEditingLocation] = useState(false);
  const [manualPincode, setManualPincode] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // GPS Location Detection
  const detectLocation = useCallback(() => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setLocationCity("India");
      setLocationPincode("");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const address = data.address || {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            address.state_district ||
            "India";
          const pincode = address.postcode || "";
          setLocationCity(city);
          setLocationPincode(pincode);
        } catch {
          setLocationCity("India");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        // User denied or error
        setLocationCity("India");
        setLocationPincode("");
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleManualPincode = () => {
    if (manualPincode.trim()) {
      setLocationCity(manualPincode.trim());
      setLocationPincode("");
    }
    setEditingLocation(false);
  };

  return (
    <>
      <SidebarMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#0b132b] via-[#1c2541] to-[#0b132b] text-white shadow-xl border-b border-blue-900/30">
        {/* Main Navbar Row — Full Edge-to-Edge Width */}
        <div className="w-full px-3 sm:px-5 lg:px-6 flex h-16 items-center gap-3 sm:gap-4">
          {/* Far Left: Hamburger Menu */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-transparent px-2 py-2 hover:border-white/40 transition-colors font-bold text-white shrink-0"
            aria-label="Open Menu"
          >
            <Menu className="h-6 w-6" />
            <span className="hidden sm:inline text-sm font-bold">All</span>
          </button>

          {/* Logo */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Delivery Location (Desktop) */}
          <div className="hidden lg:flex items-center shrink-0">
            {!editingLocation ? (
              <button
                onClick={() => {
                  setEditingLocation(true);
                  setManualPincode(locationPincode || locationCity);
                }}
                className="flex items-center gap-2 rounded-md border border-transparent px-2.5 py-2 hover:border-white/40 transition-colors text-left"
              >
                <MapPin className="h-5 w-5 text-white/70 shrink-0" />
                <div className="leading-snug">
                  <span className="block text-[11px] text-gray-400 font-medium">Deliver to</span>
                  <span className="block text-sm font-bold text-white flex items-center gap-1">
                    {isLocating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" /> Detecting...
                      </>
                    ) : (
                      <>
                        {locationCity}
                        {locationPincode ? ` ${locationPincode}` : ""}
                      </>
                    )}
                  </span>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-white/40 px-2.5 py-2 bg-white/10">
                <MapPin className="h-5 w-5 text-white/70 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={manualPincode}
                  onChange={(e) => setManualPincode(e.target.value)}
                  onBlur={handleManualPincode}
                  onKeyDown={(e) => e.key === "Enter" && handleManualPincode()}
                  placeholder="Enter pincode or city"
                  className="w-32 bg-transparent text-sm font-bold text-white placeholder:text-gray-400 outline-none"
                />
                <button
                  onClick={detectLocation}
                  className="text-amber-400 hover:text-amber-300"
                  title="Use GPS"
                >
                  <Navigation className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Center: Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-4 hidden sm:flex">
            <div className="flex w-full items-center rounded-lg overflow-hidden bg-white shadow-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for phones, laptops, gaming consoles..."
                className="flex-1 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-slate-950 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Right: Nav Links (Desktop only) */}
          <nav className="hidden xl:flex items-center gap-2 shrink-0" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md border border-transparent px-3 py-2 text-sm font-bold transition-colors hover:border-white/40",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-amber-400"
                    : "text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions (Pushed to far right corner) */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {/* Cart */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-2 hover:border-white/40 transition-colors"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5 text-white" />
              <span className="hidden sm:block text-sm font-bold text-white">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 min-w-[18px] h-[18px] px-1">
                  {itemCount}
                </span>
              )}
            </button>

            {isAuthenticated && user ? (
              <>
                {/* Wishlist (Desktop) */}
                <Link
                  href="/dashboard?tab=wishlist"
                  className="hidden md:flex items-center gap-1 rounded-md border border-transparent p-1.5 hover:border-white/40 transition-colors"
                >
                  <Heart className="h-5 w-5 text-white" />
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-md border border-transparent px-2.5 py-2 hover:border-white/40 transition-colors"
                  >
                    <div className="leading-snug text-left hidden sm:block">
                      <span className="block text-[11px] text-gray-400 font-medium">Hello, {user?.firstName || "User"}</span>
                      <span className="block text-sm font-bold text-white flex items-center gap-0.5">
                        Account
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      </span>
                    </div>
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName || "User"}
                        className="h-7 w-7 rounded-full object-cover border border-amber-400 sm:hidden"
                      />
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-slate-950 sm:hidden">
                        {(user?.firstName?.charAt(0) || "U").toUpperCase()}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl text-foreground"
                        >
                          <div className="px-3 py-2.5 border-b border-border mb-1">
                            <p className="text-sm font-bold">{user?.firstName || "User"} {user?.lastName || ""}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
                          </div>
                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-orange-600 hover:bg-orange-50"
                            >
                              👑 Web Admin Panel
                            </Link>
                          )}
                          {user.role === "seller" ? (
                            <Link
                              href="/seller/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                            >
                              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                              Seller Dashboard
                            </Link>
                          ) : (
                            <Link
                              href="/dashboard"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                            >
                              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                              My Dashboard
                            </Link>
                          )}
                          <Link
                            href="/sell"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-muted"
                          >
                            <PlusCircle className="h-4 w-4 text-muted-foreground" />
                            Sell an Item
                          </Link>
                          <div className="border-t border-border mt-1 pt-1">
                            <button
                              onClick={handleLogout}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10"
                            >
                              <LogOut className="h-4 w-4" />
                              Sign out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center rounded-md border border-transparent px-2.5 py-2 hover:border-white/40 transition-colors"
              >
                <div className="leading-snug text-left">
                  <span className="block text-[11px] text-gray-400 font-medium">Hello, Sign in</span>
                  <span className="block text-sm font-bold text-white flex items-center gap-0.5">
                    Account
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </span>
                </div>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10 sm:hidden text-white"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Sub-nav row: Nav links + location for medium screens */}
        <div className="bg-[#132238] border-t border-blue-500/20">
          <div className="w-full px-3 sm:px-5 lg:px-6 flex items-center h-11 gap-5 overflow-x-auto no-scrollbar">
            {/* Sidebar trigger for non-xl */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden flex items-center gap-1.5 text-sm font-bold text-white hover:text-amber-400 shrink-0"
            >
              <Menu className="h-4 w-4" /> All
            </button>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-semibold transition-colors shrink-0",
                  pathname === link.href || pathname.startsWith(link.href + "/")
                    ? "text-amber-400"
                    : "text-gray-300 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}

            <span className="text-sm text-gray-300 font-semibold shrink-0 hover:text-white cursor-pointer">Today&apos;s Deals</span>
            <div className="relative group shrink-0">
              <span className="text-sm text-gray-300 font-semibold hover:text-white cursor-pointer py-2">Customer Service</span>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-72 rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 translate-y-2 group-hover:translate-y-0">
                <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Tariani Support Desk</div>
                <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
                  Need help with an order or product? Our verified experts are available from 9 AM to 9 PM IST.
                </p>
                <div className="space-y-2">
                  <a href="https://wa.me/919475002048" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group/link">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600 group-hover/link:bg-emerald-500 group-hover/link:text-white group-hover/link:scale-110 transition-all shadow-sm">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 leading-tight">WhatsApp Chat</div>
                      <div className="text-xs font-semibold text-emerald-600">+91 9475002048</div>
                    </div>
                  </a>
                  <a href="mailto:aryansinghtariani@gmail.com" className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all group/link">
                    <div className="p-2 bg-amber-100 rounded-full text-amber-600 group-hover/link:bg-amber-400 group-hover/link:text-slate-900 group-hover/link:scale-110 transition-all shadow-sm">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-sm font-bold text-slate-900 leading-tight">Email Support</div>
                      <div className="text-xs font-semibold text-amber-600 truncate max-w-[160px]">aryansinghtariani@gmail.com</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <span className="text-sm text-gray-300 font-semibold shrink-0 hover:text-white cursor-pointer">Gift Cards</span>

            {/* Mobile location pill */}
            <button
              onClick={detectLocation}
              className="lg:hidden ml-auto flex items-center gap-1 text-xs text-gray-400 font-medium shrink-0 hover:text-white"
            >
              <MapPin className="h-3 w-3" />
              {isLocating ? "Locating..." : locationCity}
            </button>
          </div>
        </div>

        {/* Mobile Search (visible only on small screens) */}
        <div className="sm:hidden bg-[#132238] px-3 pb-2">
          <form onSubmit={handleSearchSubmit} className="flex items-center rounded-lg overflow-hidden bg-white shadow-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 px-4 py-2 text-slate-950 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-blue-500/20 bg-[#0b132b] text-white sm:hidden"
            >
              <nav className="w-full px-4 flex flex-col gap-1 py-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-semibold",
                      pathname === link.href
                        ? "bg-white/10 text-amber-400 font-bold"
                        : "text-gray-300 hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                    <Button variant="outline" fullWidth as={Link} href="/login" onClick={() => setMobileOpen(false)} className="border-white text-white hover:bg-white/10 font-bold">
                      Sign in
                    </Button>
                    <Button fullWidth as={Link} href="/register" onClick={() => setMobileOpen(false)} className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold">
                      Get started
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
