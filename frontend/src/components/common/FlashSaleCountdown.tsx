"use client";
import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export function FlashSaleCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 4,
    minutes: 18,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTwoDigits = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-slate-950 px-3.5 py-1.5 text-white shadow-md border border-slate-800">
      <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
      <span className="text-xs font-bold text-slate-300 hidden sm:inline">Ends In:</span>
      <div className="flex items-center gap-1 text-xs font-black font-mono tracking-wider">
        <span className="rounded bg-rose-600 px-1.5 py-0.5 text-white">{formatTwoDigits(timeLeft.hours)}h</span>
        <span className="text-amber-400">:</span>
        <span className="rounded bg-rose-600 px-1.5 py-0.5 text-white">{formatTwoDigits(timeLeft.minutes)}m</span>
        <span className="text-amber-400">:</span>
        <span className="rounded bg-rose-600 px-1.5 py-0.5 text-white">{formatTwoDigits(timeLeft.seconds)}s</span>
      </div>
    </div>
  );
}
