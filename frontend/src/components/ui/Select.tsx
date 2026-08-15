import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  hint?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, children, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;
    const describedBy = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={cn(
              "h-11 w-full appearance-none rounded-xl border border-input bg-surface pl-3.5 pr-10 text-sm text-foreground shadow-sm transition-all",
              "focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring/30",
              "disabled:cursor-not-allowed disabled:opacity-55",
              error && "border-danger focus:border-danger focus:ring-danger/25",
              className,
            )}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options
              ? options.map((option) => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 my-auto h-4 w-4 text-muted-foreground"
          />
        </div>
        {error ? (
          <p id={`${selectId}-error`} className="text-sm text-danger">
            {error}
          </p>
        ) : hint ? (
          <p id={`${selectId}-hint`} className="text-sm text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Select.displayName = "Select";
