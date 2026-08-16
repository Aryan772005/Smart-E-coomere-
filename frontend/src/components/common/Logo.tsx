import Link from "next/link";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
  showText?: boolean;
  href?: string;
  isDarkThemeNav?: boolean;
}

export function Logo({ className, showText = true, href = "/", isDarkThemeNav = false }: LogoProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-2.5 group", className)}>
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-transparent transition-all duration-300 group-hover:scale-105 overflow-hidden">
        <img src="/logo.png" alt="Tariani Sellers Logo" className="h-full w-full object-cover" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight leading-none text-white">
            Tariani<span className="text-blue-400 ml-1">Sellers</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 opacity-90">
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
