"use client";
import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export interface CartItem {
  id: number;
  slug: string;
  title: string;
  price: number;
  original_price: number | null;
  image: string;
  condition: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("tariani_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      } else {
        // Default initial item if nothing is saved
        setItems([
          {
            id: 1,
            slug: "refurbished-apple-iphone-14-128gb-blue",
            title: "Refurbished Apple iPhone 14 (128GB - Blue)",
            price: 42999,
            original_price: 69900,
            image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400&auto=format&fit=crop&q=80",
            condition: "like-new",
            quantity: 1,
          }
        ]);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("tariani_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (newItem: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) => (i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const rawTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = discountApplied ? Math.round(rawTotal * 0.1) : 0;
  const totalPrice = Math.max(0, rawTotal - discountAmount);

  const freeShippingThreshold = 50000;
  const progressToFreeShipping = Math.min(100, (rawTotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "SINGH10") {
      setDiscountApplied(true);
    } else {
      alert("Invalid Promo Code. Try 'SINGH10' for 10% off!");
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        totalPrice,
      }}
    >
      {children}

      {/* Slide-Over Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-screen max-w-md border-l border-border bg-card shadow-2xl"
              >
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-border p-5">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-brand" />
                      <h2 className="text-lg font-bold text-foreground">Shopping Cart ({itemCount})</h2>
                    </div>
                    <button
                      onClick={closeCart}
                      className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Free Shipping Progress Bar */}
                  <div className="bg-brand-soft px-5 py-3 border-b border-border text-xs">
                    <div className="flex justify-between font-semibold text-foreground mb-1">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                        <Truck className="h-3.5 w-3.5" />
                        {rawTotal >= freeShippingThreshold ? "Free Express Shipping Unlocked! 🎉" : `Add ₹${(freeShippingThreshold - rawTotal).toLocaleString()} more for Free Express Shipping`}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-brand transition-all duration-500"
                        style={{ width: `${progressToFreeShipping}%` }}
                      />
                    </div>
                  </div>

                  {/* Cart Items List */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {items.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                        <ShoppingBag className="h-16 w-16 opacity-30 mb-3" />
                        <p className="font-semibold text-foreground">Your cart is empty</p>
                        <p className="text-xs mt-1">Explore pre-owned gadgets with 6-Month warranty.</p>
                        <Button variant="outline" size="sm" onClick={closeCart} className="mt-4">
                          Browse Products
                        </Button>
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-4 rounded-2xl border border-border bg-background p-3.5 shadow-sm"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="h-20 w-20 rounded-xl object-cover border border-border"
                          />
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between">
                                <h3 className="line-clamp-1 text-xs font-bold text-foreground">{item.title}</h3>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-muted-foreground hover:text-rose-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="mt-1 text-sm font-extrabold text-brand">
                                ₹{item.price.toLocaleString("en-IN")}
                              </p>
                            </div>

                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center rounded-lg border border-border bg-card">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart Footer Summary */}
                  {items.length > 0 && (
                    <div className="border-t border-border bg-card p-5 space-y-4 shadow-lg">
                      {/* Promo Code Box */}
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Promo Code (Try SINGH10)"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                            className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-xs uppercase focus:outline-none focus:ring-2 focus:ring-ring/30"
                          />
                        </div>
                        <button
                          type="submit"
                          className="rounded-xl bg-brand/10 px-3.5 py-2 text-xs font-bold text-brand hover:bg-brand/20 transition-colors"
                        >
                          Apply
                        </button>
                      </form>

                      {discountApplied && (
                        <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Promo SINGH10 Applied (10% Off)</span>
                          <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                        </div>
                      )}

                      {/* Summary lines */}
                      <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span className="font-semibold text-foreground">₹{rawTotal.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Singh Sellers Guarantee & Insurance</span>
                          <span className="font-semibold text-emerald-500">FREE</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Express Delivery</span>
                          <span className="font-semibold text-emerald-500">FREE</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 text-sm font-black text-foreground">
                          <span>Total Amount</span>
                          <span className="text-base text-brand">₹{totalPrice.toLocaleString("en-IN")}</span>
                        </div>
                      </div>

                      <Button
                        fullWidth
                        size="lg"
                        onClick={() => {
                          closeCart();
                          window.location.href = "/checkout";
                        }}
                        rightIcon={<ArrowRight className="h-4 w-4" />}
                      >
                        Proceed to Checkout (Escrow Safe)
                      </Button>

                      <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Protected by Singh Sellers Escrow Guarantee</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
