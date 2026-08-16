"use client";
import { ShieldCheck, Truck, RotateCcw, Zap } from "lucide-react";

export function MarqueeBanner() {
  return (
    <div className="relative flex overflow-x-hidden bg-brand/10 border-y border-brand/20 py-2.5 dark:bg-brand/5 dark:border-brand/10">
      <div className="animate-marquee whitespace-nowrap flex items-center gap-10">
        {/* We repeat the content a few times to ensure a smooth continuous loop */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-10 shrink-0">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <Zap className="h-4 w-4 text-brand" /> OVER 50,000+ HAPPY CUSTOMERS
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <Truck className="h-4 w-4 text-brand" /> FREE EXPRESS SHIPPING IN INDIA
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-brand" /> 32-POINT QUALITY INSPECTION
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <RotateCcw className="h-4 w-4 text-brand" /> 6-MONTH REPLACEMENT WARRANTY
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
          </div>
        ))}
      </div>
      
      {/* Absolute duplicate for seamless infinite scrolling */}
      <div className="absolute top-2.5 animate-marquee2 whitespace-nowrap flex items-center gap-10">
        {[...Array(4)].map((_, i) => (
          <div key={i + 10} className="flex items-center gap-10 shrink-0">
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <Zap className="h-4 w-4 text-brand" /> OVER 50,000+ HAPPY CUSTOMERS
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <Truck className="h-4 w-4 text-brand" /> FREE EXPRESS SHIPPING IN INDIA
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-brand" /> 32-POINT QUALITY INSPECTION
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
            <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">
              <RotateCcw className="h-4 w-4 text-brand" /> 6-MONTH REPLACEMENT WARRANTY
            </span>
            <span className="text-slate-300 dark:text-slate-700 font-bold">•</span>
          </div>
        ))}
      </div>
    </div>
  );
}
