import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type SpinnerSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-9 w-9",
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <Loader2 className={cn("animate-spin text-current", SIZE_CLASSES[size])} aria-hidden="true" />
    </span>
  );
}
