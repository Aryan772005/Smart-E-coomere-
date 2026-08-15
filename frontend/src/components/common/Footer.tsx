"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  Headphones,
  MapPin,
  ChevronUp,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#0b132b] text-white font-sans text-xs">
      {/* 1. BACK TO TOP BUTTON */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#1c2541] hover:bg-[#253358] transition-colors py-3 text-center text-xs font-semibold text-white tracking-wider flex items-center justify-center gap-1 cursor-pointer"
        aria-label="Back to top"
      >
        <span>Back to top</span>
        <ChevronUp className="h-4 w-4" />
      </button>

      {/* 2. TRUST ASSURANCE BANNER (Builds Buyer & Seller Confidence) */}
      <div className="border-b border-blue-900/40 bg-[#132238] py-6">
        <div className="container-page grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-md border border-white/10">
            <div className="p-2.5 rounded-full bg-[#febd69] text-black">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#febd69]">32-Point Quality Check</h4>
              <p className="text-gray-300 text-[11px]">Every device pre-inspected & certified</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-md border border-white/10">
            <div className="p-2.5 rounded-full bg-[#febd69] text-black">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#febd69]">6-Month Warranty</h4>
              <p className="text-gray-300 text-[11px]">Instant replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-md border border-white/10">
            <div className="p-2.5 rounded-full bg-[#febd69] text-black">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#febd69]">Express Shipping</h4>
              <p className="text-gray-300 text-[11px]">Free & insured doorstep delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 p-3 rounded-md border border-white/10">
            <div className="p-2.5 rounded-full bg-[#febd69] text-black">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#febd69]">Escrow Safe Payment</h4>
              <p className="text-gray-300 text-[11px]">Payment released only after delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN MULTI-COLUMN FOOTER LINKS */}
      <div className="bg-[#232f3e] py-10">
        <div className="container-page grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Customer Contact & Trust Center (User's Details) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
              Direct Contact & Support
            </h3>
            <p className="text-gray-300 leading-relaxed text-[12px]">
              Have a question or need instant assistance with your order? Reach out directly to our store team.
            </p>
            
            <div className="space-y-2.5 pt-1">
              <a
                href="tel:9475002048"
                className="flex items-center gap-3 text-white hover:text-[#febd69] transition-colors group bg-white/5 p-2.5 rounded border border-gray-700"
              >
                <div className="p-2 bg-[#febd69] text-black rounded-full group-hover:scale-105 transition-transform">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-[10px] text-gray-400 font-semibold uppercase">Call / WhatsApp Support</span>
                  <span className="text-sm font-bold tracking-wide">+91 9475002048</span>
                </div>
              </a>

              <a
                href="mailto:aryansinghtariani@gmail.com"
                className="flex items-center gap-3 text-white hover:text-[#febd69] transition-colors group bg-white/5 p-2.5 rounded border border-gray-700"
              >
                <div className="p-2 bg-[#febd69] text-black rounded-full group-hover:scale-105 transition-transform">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="block text-[10px] text-gray-400 font-semibold uppercase">Email Us Directly</span>
                  <span className="text-xs font-bold truncate block">aryansinghtariani@gmail.com</span>
                </div>
              </a>
            </div>

            <div className="flex items-center gap-2 text-gray-300 text-[11px] pt-1">
              <Clock className="h-3.5 w-3.5 text-[#febd69]" />
              <span>Available 9:00 AM – 9:00 PM IST (Mon–Sat)</span>
            </div>
          </div>

          {/* Column 2: Get to Know Us */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
              Get to Know Us
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/browse" className="hover:underline hover:text-white transition-colors">
                  About Tariani Sellers
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:underline hover:text-white transition-colors">
                  32-Point Quality Certification
                </Link>
              </li>
              <li>
                <Link href="/browse?category=smartphones" className="hover:underline hover:text-white transition-colors">
                  Refurbished Mobile Standards
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline hover:text-white transition-colors">
                  Eco-Friendly Packaging Mission
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline hover:text-white transition-colors">
                  Verified Buyer Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Make Money with Us */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
              Sell & Trade-In
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/sell" className="hover:underline hover:text-white transition-colors text-[#febd69] font-semibold">
                  Sell Your Device Instantly
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:underline hover:text-white transition-colors">
                  Instant Cash Valuation
                </Link>
              </li>
              <li>
                <Link href="/sell" className="hover:underline hover:text-white transition-colors">
                  Free Doorstep Pickup
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:underline hover:text-white transition-colors">
                  Seller Dashboard & Portal
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline hover:text-white transition-colors">
                  Corporate Bulk Liquidation
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Protection & Policy */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
              Let Us Help You
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href="/orders" className="hover:underline hover:text-white transition-colors">
                  Your Account & Orders
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline hover:text-white transition-colors">
                  Shipping Rates & Policies
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline hover:text-white transition-colors">
                  Returns & Replacement Policy
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline hover:text-white transition-colors">
                  Warranty Claim Center
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:underline hover:text-white transition-colors">
                  100% Purchase Protection
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 4. BRAND BADGE & REGIONAL FOOTER */}
      <div className="border-t border-gray-700 bg-[#131921] py-6">
        <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#febd69] text-black px-2.5 py-1 font-black text-sm rounded tracking-tight">
              TARIANI SELLERS
            </div>
            <span className="text-gray-400 text-[11px]">India&apos;s Trusted Certified Pre-Owned Store</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-gray-300 text-[11px]">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> 100% Genuine Products</span>
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-400" /> Verified Seller</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-red-400" /> All India Delivery</span>
          </div>
        </div>
      </div>

      {/* 5. COPYRIGHT & DISCLAIMER FOOTER */}
      <div className="bg-[#0f1111] py-6 text-gray-400 text-[11px] text-center border-t border-gray-800">
        <div className="container-page space-y-2">
          <div className="flex flex-wrap justify-center gap-4 text-gray-300">
            <Link href="/browse" className="hover:underline">Conditions of Use & Sale</Link>
            <Link href="/browse" className="hover:underline">Privacy Notice</Link>
            <Link href="/browse" className="hover:underline">Interest-Based Ads</Link>
            <Link href="/browse" className="hover:underline">Warranty Terms</Link>
          </div>
          <p className="text-gray-400">
            © {new Date().getFullYear()} Tariani Sellers Pvt. Ltd. | Contact: <a href="tel:9475002048" className="text-[#febd69] hover:underline">+91 9475002048</a> | Email: <a href="mailto:aryansinghtariani@gmail.com" className="text-[#febd69] hover:underline">aryansinghtariani@gmail.com</a>
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto leading-normal">
            Tariani Sellers is an independent marketplace for certified pre-owned, open-box & refurbished gadgets. All brand logos and trademarks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
