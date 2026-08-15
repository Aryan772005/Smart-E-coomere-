"use client";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

function extractMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return null;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  error,
  onRetry,
  retryLabel = "Try again",
  action,
  className,
  compact = false,
}: ErrorStateProps) {
  const message = extractMessage(error);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        compact ? "py-8" : "py-16",
        className,
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10 text-danger">
        <AlertTriangle className="h-8 w-8" aria-hidden="true" />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className={cn("font-semibold text-foreground", compact ? "text-base" : "text-lg")}>
          {title}
        </h3>
        {(description || message) && (
          <p className="text-sm text-muted-foreground">{description ?? message}</p>
        )}
      </div>
      {(onRetry || action) && (
        <div className="mt-1 flex items-center gap-2">
          {onRetry ? <Button onClick={onRetry}>{retryLabel}</Button> : null}
          {action}
        </div>
      )}
    </motion.div>
  );
}
