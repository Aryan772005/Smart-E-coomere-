import Link from "next/link";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
  isDarkThemeNav?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className, showText = true, href = "/", isDarkThemeNav = false, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24"
  };

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group", className)}>
      <div className={cn("relative flex items-center justify-center rounded-xl bg-transparent transition-all duration-300 group-hover:scale-105 overflow-hidden", sizeClasses[size])}>
        <img src="/logo.png" alt="Tariani Sellers Logo" className="h-full w-full object-cover" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-black tracking-tight leading-none text-white",
            size === "sm" ? "text-base" : size === "xl" ? "text-3xl" : size === "lg" ? "text-2xl" : "text-lg"
          )}>
            Tariani<span className="text-blue-400 ml-1">Sellers</span>
          </span>
          <span className={cn(
            "font-bold uppercase tracking-widest text-slate-300 opacity-90",
            size === "sm" ? "text-[8px]" : size === "xl" ? "text-xs" : size === "lg" ? "text-[11px]" : "text-[10px]"
          )}>
            Certified Recommerce
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} aria-label="Singh Sellers home">
        {content}
      </Link>
    );
  }

  return content;
}
