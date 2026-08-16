"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  ShoppingBag,
  Heart,
  Store,
  HelpCircle,
  LogOut,
  ChevronRight,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Tv,
  Phone,
  Mail,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarMenu({ isOpen, onClose }: SidebarMenuProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    onClose();
    window.location.href = "/";
  };

  const categories = [
    { name: "Mobiles & Smartphones", icon: Smartphone, href: "/browse?category=mobiles" },
    { name: "Laptops & Computers", icon: Laptop, href: "/browse?category=laptops" },
    { name: "Audio & Headphones", icon: Headphones, href: "/browse?category=audio" },
    { name: "Cameras & Photography", icon: Camera, href: "/browse?category=cameras" },
    { name: "TV & Home Appliances", icon: Tv, href: "/browse?category=tv" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 flex w-4/5 max-w-[360px] flex-col bg-card shadow-2xl overflow-y-auto"
          >
            {/* Header (Hello, Sign In or Hello, User) */}
            <div className="bg-gradient-to-r from-[#0b132b] via-[#1c2541] to-[#0b132b] p-6 text-white border-b border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
                    {isAuthenticated ? (
                      user?.avatar ? (
                        <img src={user.avatar} alt="User" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <User className="h-6 w-6" />
                      )
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      Hello, {isAuthenticated ? user?.firstName || "User" : "Sign in"}
                    </h2>
                    {!isAuthenticated && (
                      <Link href="/login" onClick={onClose} className="text-sm font-medium text-amber-200 hover:underline">
                        Sign in to your account
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-white hover:bg-white/20 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Menu Content */}
            <div className="flex-1 py-4">
              {/* Trending Categories */}
              <div className="px-6 pb-2 pt-2 text-lg font-bold text-foreground">Trending Categories</div>
              <ul className="mb-4">
                {categories.map((cat) => (
                  <li key={cat.name}>
                    <Link
                      href={cat.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <cat.icon className="h-5 w-5 text-brand" />
                        {cat.name}
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mx-6 border-b border-border" />

              {/* Browse */}
              <div className="px-6 pb-2 pt-4 text-lg font-bold text-foreground">Shop & Sell</div>
              <ul className="mb-4">
                <li>
                  <Link href="/browse" onClick={onClose} className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                    <ShoppingBag className="h-5 w-5" /> View All Products
                  </Link>
                </li>
                <li>
                  <Link href="/sell" onClick={onClose} className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-brand hover:bg-muted">
                    <Store className="h-5 w-5" /> Sell on Tariani Sellers
                  </Link>
                </li>
              </ul>
              <div className="mx-6 border-b border-border" />

              {/* Account Settings */}
              <div className="px-6 pb-2 pt-4 text-lg font-bold text-foreground">Help & Settings</div>
              <ul>
                <li>
                  <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                    <User className="h-5 w-5" /> Your Account
                  </Link>
                </li>
                <li>
                  <Link href="/browse" onClick={onClose} className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Heart className="h-5 w-5" /> Your Wishlist
                  </Link>
                </li>
                <li>
                  <button onClick={() => setShowSupport(!showSupport)} className="flex w-full items-center justify-between px-6 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground text-left">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5" /> Customer Service
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showSupport ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {showSupport && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-50 dark:bg-slate-900"
                      >
                        <div className="px-14 py-3 space-y-3">
                          <p className="text-xs text-muted-foreground mb-3">Our verified experts are available from 9 AM to 9 PM IST.</p>
                          <a href="https://wa.me/919475002048" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                            <div className="p-1.5 bg-emerald-100 rounded-full text-emerald-600">
                              <Phone className="h-3 w-3" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-foreground">WhatsApp Chat</div>
                              <div className="text-[10px] text-emerald-600">+91 9475002048</div>
                            </div>
                          </a>
                          <a href="mailto:aryansinghtariani@gmail.com" className="flex items-center gap-3">
                            <div className="p-1.5 bg-amber-100 rounded-full text-amber-600">
                              <Mail className="h-3 w-3" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="text-xs font-bold text-foreground">Email Support</div>
                              <div className="text-[10px] text-amber-600 truncate max-w-[150px]">aryansinghtariani@gmail.com</div>
                            </div>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
                {isAuthenticated && (
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-6 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-left"
                    >
                      <LogOut className="h-5 w-5" /> Sign Out
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}