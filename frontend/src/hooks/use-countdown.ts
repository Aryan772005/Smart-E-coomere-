"use client";

import { useEffect, useState } from "react";

interface CountdownState {
  seconds: number;
  formatted: string;
  isComplete: boolean;
}

export function useCountdown(initialSeconds: number, running = true): CountdownState {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const timer = window.setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return {
    seconds,
    formatted: `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`,
    isComplete: seconds <= 0,
  };
}
