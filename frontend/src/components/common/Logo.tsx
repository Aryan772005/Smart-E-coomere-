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
      {/* Sleek Emblem Badge for Singh Sellers */}
      <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 p-0.5 shadow-md backdrop-blur border border-white/20 transition-all duration-300 group-hover:scale-105">
        <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
          >
            <path
              d="M16 3L26 8V16C26 22.5 21.5 27.5 16 29C10.5 27.5 6 22.5 6 16V8L16 3Z"
              fill="url(#singh-grad)"
              fillOpacity="0.3"
              stroke="url(#singh-grad)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 11C12 11 14 9.5 16 9.5C18 9.5 20 10.5 20 12.5C20 15 12 15 12 18.5C12 21 14.5 22.5 16.5 22.5C18.5 22.5 20.5 21.5 20.5 21.5"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="21" cy="9.5" r="1.5" fill="#F59E0B" />
            <defs>
              <linearGradient
                id="singh-grad"
                x1="6"
                y1="3"
                x2="26"
                y2="29"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#F43F5E" />
                <stop offset="0.5" stopColor="#E11D48" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight leading-none text-white">
            Tariani<span className="text-amber-300 ml-1">Sellers</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-100 opacity-90">
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
