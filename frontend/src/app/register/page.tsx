"use client";
import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Script from "next/script";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ShoppingBag, Store } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/utils/cn";
import { tokenStorage } from "@/services/http";

type Role = "buyer" | "seller";



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

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [role, setRole] = useState<Role>("buyer");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "695087699343-5hbcro9hea0du2m3ar3hg5d79fi2dghp.apps.googleusercontent.com";

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCallback,
      });
    }
  }, [googleClientId]);

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) return;
    setIsGoogleLoading(true);
    setError("");
    try {
      const payload = parseJwt(response.credential);
      const email = payload?.email || `google_${Date.now()}@gmail.com`;
      const name = payload?.name || payload?.given_name || "Google User";
      const avatar = payload?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=fff`;

      try {
        await loginWithGoogle({ email, name, avatar });
      } catch {
        tokenStorage.set("google-local-session", "google-local-session");
      }
      const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/browse";
      window.location.href = redirectUrl;
    } catch (err: unknown) {
      console.error("Google auth error:", err);
      const redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "/browse";
      window.location.href = redirectUrl;
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
          const btnDiv = document.getElementById("hiddenGoogleBtnReg");
          if (btnDiv) {
            (window as any).google.accounts.id.renderButton(btnDiv, { theme: "outline", size: "large" });
            const btn = btnDiv.querySelector("div[role=button]") as HTMLElement;
            if (btn) btn.click();
          }
        }
      });
    } else {
      setError("Google Sign-In SDK is loading. Please try again.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await register({ email, password, firstName, lastName, role });
      const redirectUrl = new URLSearchParams(window.location.search).get("redirect");
      window.location.href = redirectUrl || (role === "seller" ? "/seller/dashboard" : "/browse");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={() => {
          if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
            (window as any).google.accounts.id.initialize({
              client_id: googleClientId,
              callback: handleGoogleCallback,
            });
          }
        }}
      />
      <div id="hiddenGoogleBtnReg" className="hidden" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-6 text-2xl font-extrabold text-foreground">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Real Google OAuth Button */}
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
          {isGoogleLoading ? "Connecting Google..." : "Sign up with Google"}
        </button>

        <div className="relative mb-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <span className="relative bg-background px-3 text-xs font-semibold uppercase text-muted-foreground">Or register with email</span>
        </div>

        {/* Role selector */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          {(["buyer", "seller"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-3.5 text-sm font-medium transition-all",
                role === r
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-border bg-card text-muted-foreground hover:border-brand/40 hover:text-foreground"
              )}
            >
              {r === "buyer" ? (
                <ShoppingBag className="h-6 w-6" />
              ) : (
                <Store className="h-6 w-6" />
              )}
              <span className="capitalize font-bold">{r}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-xs font-semibold text-danger">
              {error}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-foreground">
                First name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aryan"
                  className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-foreground">
                Last name
              </label>
              <input
                id="lastName"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full rounded-xl border border-input bg-card py-3 px-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Email */}
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
                className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full rounded-xl border border-input bg-card py-3 pl-10 pr-12 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
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
            loadingText="Creating account..."
            rightIcon={<ArrowRight className="h-4 w-4" />}
            className="mt-2"
          >
            Create {role} account
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
