"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "@/components/ui/Spinner";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-brand-foreground shadow-brand-glow hover:brightness-110 active:brightness-95",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 active:bg-muted/70",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-muted/60 active:bg-muted",
  ghost: "bg-transparent text-foreground hover:bg-muted/70 active:bg-muted",
  danger:
    "bg-danger text-danger-foreground hover:brightness-110 active:brightness-95",
  success:
    "bg-success text-success-foreground hover:brightness-110 active:brightness-95",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 rounded-lg px-3 text-sm",
  md: "h-11 rounded-xl px-5 text-sm",
  lg: "h-12 rounded-xl px-7 text-base",
  icon: "h-10 w-10 rounded-xl p-0",
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
}

type AsComponent = ElementType;

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "as">,
    ButtonBaseProps {
  as?: "a" | AsComponent;
  href?: string;
  target?: string;
  rel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      as,
      href,
      target,
      rel,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    const MotionComponent = as === "a" ? motion.a : as ? motion.create(as) : motion.button;
    const anchorProps = as ? { href, target, rel } : {};

    return (
      <MotionComponent
        ref={ref as never}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        whileHover={isDisabled ? undefined : { scale: 1.01 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 font-medium transition-colors",
          "disabled:pointer-events-none disabled:opacity-55",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          FOCUS_RING,
          fullWidth && "w-full",
          className,
        )}
        {...(anchorProps as object)}
        {...(props as object)}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" />
            {loadingText ? <span>{loadingText}</span> : null}
          </>
        ) : (
          <>
            {leftIcon ? <span aria-hidden="true">{leftIcon}</span> : null}
            {children}
            {rightIcon ? <span aria-hidden="true">{rightIcon}</span> : null}
          </>
        )}
      </MotionComponent>
    );
  },
);

Button.displayName = "Button";
