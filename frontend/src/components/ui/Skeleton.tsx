import type { CSSProperties } from "react";
import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div aria-hidden="true" className={cn("skeleton rounded-lg", className)} style={style} />;
}
