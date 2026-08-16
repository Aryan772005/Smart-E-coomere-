"use client";
import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Script from "next/script";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

function parseJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [gsiLoaded, setGsiLoaded] = useState(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "695087699343-b34ut1o3j5lbt756clee9mu3p2p3062d.apps.googleusercontent.com";

  // Initialize official Google Sign-In SDK
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
      });
      setGsiLoaded(true);
    }
  }, [googleClientId]);

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) return;
    setIsGoogleLoading(true);
    setError("");
    try {
      const payload = parseJwt(response.credential);
      if (!payload?.email) {
        setError("Could not read your Google account details. Please try again.");
        return;
      }
      await loginWithGoogle({
        email: payload.email,
        name: payload.name || payload.given_name || "Google User",
        avatar: payload.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || "User")}&background=f59e0b&color=fff`,
        google_sub: payload.sub,
      });
      const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/browse";
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-in failed. The backend server may be starting up — please wait 30 seconds and try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    setError("");
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
      });
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to rendering button click if prompt is suppressed
          const btnDiv = document.getElementById("hiddenGoogleBtn");
          if (btnDiv) {
            (window as any).google.accounts.id.renderButton(btnDiv, { theme: "outline", size: "large" });
            const btn = btnDiv.querySelector("div[role=button]") as HTMLElement;
            if (btn) btn.click();
          }
        }
      });
    } else {
      setError("Google Sign-In SDK is loading. Please try again in a moment.");
    }
  };

  const handleSubmitEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/browse";
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: "seller" | "buyer" | "admin") => {
    if (role === "admin") {
      setEmail("admin@tarianisellers.com");
      setPassword("admin1234");
    } else {
      setEmail(`${role}@tarianisellers.com`);
      setPassword("demo1234");
    }
    setError("");
  };

  return (
    <div className="min-h-screen flex">
      {/* Official Google GSI Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => {
          if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
            (window as any).google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleCallback,
            });
            setGsiLoaded(true);
          }
        }}
      />

      <div id="hiddenGoogleBtn" className="hidden" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex-col items-center justify-center p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
          backgroundSize: "50px 50px"
        }} />
        
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md text-center flex flex-col items-center"
        >
          {/* Mobile Login Security Illustration */}
          <div className="mb-6 w-full max-w-sm overflow-hidden rounded-2xl bg-white p-2 shadow-2xl border-2 border-slate-950 transform hover:scale-105 transition-transform duration-300">
            <img
              src="/login_security_banner.jpg"
              alt="Tariani Sellers Secure Mobile Authentication Illustration"
              className="h-auto w-full object-cover rounded-xl"
            />
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-tight">
            Welcome Back to Tariani Sellers
          </h1>
          <p className="mt-2 text-sm font-medium text-amber-100 leading-relaxed">
            India&apos;s certified recommerce network. Buy & sell verified devices with 100% Escrow Protection.
          </p>

          <div className="mt-6 w-full space-y-2 text-left">
            {[
              "🌐 Official Google OAuth 2.0 Integration",
              "📱 Secure Authentication",
              "🔒 Escrow Payment Protection Guarantee",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 rounded-xl bg-black/20 px-3.5 py-2.5 text-xs font-semibold backdrop-blur border border-white/10 text-amber-100">
                {feat}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <Logo />
            <h2 className="mt-6 text-2xl font-extrabold text-foreground">Sign in to your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-brand hover:underline">
                Create account
              </Link>
            </p>
          </div>

          {/* Official Real Google OAuth Button */}
          <button
            type="button"
            onClick={triggerGoogleSignIn}
            disabled={isGoogleLoading}
            className="mb-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card py-3 px-4 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted hover:border-brand/40 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            {isGoogleLoading ? "Connecting Google..." : "Continue with Google"}
          </button>

          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <span className="relative bg-background px-3 text-xs font-semibold uppercase text-muted-foreground">Or continue with email</span>
          </div>

          {/* Demo shortcuts */}
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo("buyer")}
              className="flex-1 rounded-lg border border-border bg-muted/50 py-1.5 px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              🛍 Buyer
            </button>
            <button
              type="button"
              onClick={() => fillDemo("seller")}
              className="flex-1 rounded-lg border border-border bg-muted/50 py-1.5 px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              🏪 Seller
            </button>
            <button
              type="button"
              onClick={() => fillDemo("admin")}
              className="flex-1 rounded-lg border border-brand/30 bg-brand-soft py-1.5 px-2 text-xs font-bold text-brand transition-colors"
            >
              👑 Admin
            </button>
          </div>

          <form onSubmit={handleSubmitEmail} className="space-y-4" noValidate>
            {error && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs font-semibold text-danger">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              loadingText="Signing in..."
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="mt-2"
            >
              Sign in
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
