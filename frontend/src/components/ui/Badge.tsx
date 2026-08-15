import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "outline";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-brand-soft text-brand",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-danger/12 text-danger",
  outline: "border border-border text-muted-foreground",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
