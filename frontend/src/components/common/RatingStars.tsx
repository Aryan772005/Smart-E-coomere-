"use client";
import { Star } from "lucide-react";
import { cn } from "@/utils/cn";

type StarSize = "sm" | "md" | "lg";

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: StarSize;
  showValue?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<StarSize, string> = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

function StarRow({ value, size }: { value: number; size: StarSize }) {
  const stars = [];
  const normalized = Math.max(0, Math.min(5, value));

  for (let i = 1; i <= 5; i += 1) {
    const fraction = normalized - (i - 1);
    if (fraction >= 1) {
      stars.push(
        <Star
          key={i}
          aria-hidden="true"
          className={cn(SIZE_CLASSES[size], "fill-amber-400 text-amber-400")}
        />,
      );
    } else if (fraction > 0) {
      stars.push(
        <span key={i} className="relative inline-flex" aria-hidden="true">
          <Star className={cn(SIZE_CLASSES[size], "text-muted-foreground/40")} />
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fraction * 100}%` }}>
            <Star className={cn(SIZE_CLASSES[size], "fill-amber-400 text-amber-400")} />
          </span>
        </span>,
      );
    } else {
      stars.push(
        <Star
          key={i}
          aria-hidden="true"
          className={cn(SIZE_CLASSES[size], "text-muted-foreground/40")}
        />,
      );
    }
  }
  return <span className="inline-flex items-center gap-0.5">{stars}</span>;
}

export function RatingStars({
  value,
  count,
  size = "md",
  showValue = false,
  className,
}: RatingStarsProps) {
  const rounded = Math.round(value * 10) / 10;

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Rated ${rounded} out of 5${count ? ` by ${count} reviewers` : ""}`}
    >
      <StarRow value={value} size={size} />
      {showValue ? <span className="text-sm font-semibold text-foreground">{rounded}</span> : null}
      {count !== undefined ? (
        <span className="text-xs text-muted-foreground">({count})</span>
      ) : null}
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
  size = "lg",
}: {
  value: number;
  onChange: (value: number) => void;
  size?: StarSize;
}) {
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value >= star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            aria-hidden="true"
            className={cn(
              SIZE_CLASSES[size],
              star <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}
