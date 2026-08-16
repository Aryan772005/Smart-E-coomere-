"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Tag, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ActivityEvent {
  id: number;
  type: "purchase" | "listed";
  user: string;
  productName: string;
  timeAgo: string;
  url: string;
  icon: "bag" | "tag";
}

const ACTIVITIES: ActivityEvent[] = [
  { id: 1, type: "purchase", user: "Someone in Mumbai", productName: "Apple iPhone 15 Pro Max", timeAgo: "Just now", url: "/browse?search=iPhone", icon: "bag" },
  { id: 2, type: "listed", user: "A verified seller", productName: "Sony PlayStation 5 Disc Edition", timeAgo: "2 mins ago", url: "/browse?search=PS5", icon: "tag" },
  { id: 3, type: "purchase", user: "Someone in Delhi", productName: "Samsung Galaxy S24 Ultra", timeAgo: "5 mins ago", url: "/browse?search=Samsung", icon: "bag" },
  { id: 4, type: "listed", user: "A user in Bangalore", productName: "MacBook Pro 16 M2 Max", timeAgo: "12 mins ago", url: "/browse?search=Macbook", icon: "tag" },
  { id: 5, type: "purchase", user: "Someone in Pune", productName: "Apple Watch Ultra 2", timeAgo: "15 mins ago", url: "/browse?search=Watch", icon: "bag" }
];

export function LiveActivityToast() {
  const [currentActivity, setCurrentActivity] = useState<ActivityEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const triggerNextActivity = () => {
      // Pick a random activity
      const next = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];
      setCurrentActivity(next);
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);

      // Schedule next appearance in 15 to 30 seconds
      const nextInterval = Math.floor(Math.random() * (30000 - 15000 + 1) + 15000);
      timeout = setTimeout(triggerNextActivity, nextInterval);
    };

    // Start first activity after 3 seconds
    timeout = setTimeout(triggerNextActivity, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && currentActivity && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="fixed bottom-6 left-6 z-[100] max-w-sm pointer-events-auto"
        >
          <Link href={currentActivity.url} className="block group">
            <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/20 bg-slate-900/80 p-3 pr-5 shadow-2xl backdrop-blur-xl transition-all hover:bg-slate-900/90 hover:border-white/30 dark:bg-slate-900/90 dark:border-slate-700">
              {/* Subtle Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${currentActivity.icon === 'bag' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand/20 text-brand'}`}>
                {currentActivity.icon === 'bag' ? (
                  <ShoppingBag className="h-5 w-5" />
                ) : (
                  <Tag className="h-5 w-5" />
                )}
              </div>
              
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  {currentActivity.type === 'purchase' ? (
                    <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Verified Purchase</>
                  ) : (
                    "New Listing"
                  )}
                  <span className="mx-1">•</span>
                  {currentActivity.timeAgo}
                </span>
                <p className="mt-0.5 text-xs text-slate-300">
                  <span className="font-semibold text-white">{currentActivity.user}</span> {currentActivity.type === 'purchase' ? 'just bought' : 'just listed'}
                </p>
                <p className="text-sm font-bold text-white line-clamp-1 group-hover:text-brand transition-colors">
                  {currentActivity.productName}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
