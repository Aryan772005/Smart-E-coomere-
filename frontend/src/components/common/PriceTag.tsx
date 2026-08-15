import { cn } from "@/utils/cn";
import { formatCurrency } from "@/utils/format";

interface PriceTagProps {
  amount: number;
  originalAmount?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
} as const;

const ORIGINAL_SIZE = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const;

export function PriceTag({ amount, originalAmount, size = "md", className }: PriceTagProps) {
  const hasDiscount = originalAmount != null && originalAmount > amount;

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold tracking-tight text-foreground", SIZE_CLASSES[size])}>
        {formatCurrency(amount)}
      </span>
      {hasDiscount ? (
        <s className={cn("text-muted-foreground/70", ORIGINAL_SIZE[size])}>
          {formatCurrency(originalAmount as number)}
        </s>
      ) : null}
    </span>
  );
}
