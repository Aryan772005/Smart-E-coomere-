import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  maxLengthIndicator?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, maxLengthIndicator = false, className, id, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id ?? autoId;
    const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={cn(
            "min-h-28 w-full resize-y rounded-xl border border-input bg-surface px-3.5 py-3 text-sm text-foreground shadow-sm transition-all",
            "placeholder:text-muted-foreground",
            "focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring/30",
            "disabled:cursor-not-allowed disabled:opacity-55",
            error && "border-danger focus:border-danger focus:ring-danger/25",
            className,
          )}
          {...props}
        />
        {maxLengthIndicator && props.maxLength ? (
          <span className="text-right text-xs text-muted-foreground">
            {String(props.value ?? "").length}/{props.maxLength}
          </span>
        ) : null}
        {error ? (
          <p id={`${textareaId}-error`} className="text-sm text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
