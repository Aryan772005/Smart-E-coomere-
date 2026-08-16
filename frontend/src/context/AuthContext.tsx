"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { tokenStorage } from "@/services/http";
import type { User } from "@/types/user";
import { apiUrl } from "@/config/env";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface GoogleLoginData {
  email: string;
  name: string;
  avatar?: string;
  google_sub?: string;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (data: GoogleLoginData) => Promise<void>;
  sendOtp: (phone: string) => Promise<{ code?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "buyer" | "seller";
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapRawUser(raw: any): User {
  if (!raw) {
    return {
      id: 0,
      email: "",
      phone: "",
      firstName: "User",
      lastName: "",
      avatar: null,
      role: "buyer",
      status: "active",
      isEmailVerified: false,
      isPhoneVerified: false,
      bio: "",
      rating: 5,
      reviewCount: 0,
      completedOrders: 0,
      createdAt: new Date().toISOString(),
    };
  }
  return {
    id: raw.id || 0,
    email: raw.email || "",
    phone: raw.phone || "",
    firstName: raw.first_name || raw.firstName || (raw.email ? raw.email.split("@")[0] : "User"),
    lastName: raw.last_name || raw.lastName || "",
    avatar: raw.avatar || null,
    role: raw.role || "buyer",
    status: raw.status || "active",
    isEmailVerified: raw.is_email_verified ?? raw.isEmailVerified ?? false,
    isPhoneVerified: raw.is_phone_verified ?? raw.isPhoneVerified ?? false,
    bio: raw.bio || "",
    rating: raw.rating ?? 5,
    reviewCount: raw.review_count ?? 0,
    completedOrders: raw.completed_orders ?? 0,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const fetchMe = useCallback(async () => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }
    try {
      const res = await fetch(apiUrl("/api/v1/auth/me/"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const raw = await res.json();
        setState({ user: mapRawUser(raw), isLoading: false, isAuthenticated: true });
      } else {
        tokenStorage.clear();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(apiUrl("/api/v1/auth/login/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.detail || err?.non_field_errors?.[0] || "Login failed");
    }
    const data = await res.json();
    tokenStorage.set(data.access, data.refresh);
    setState({ user: mapRawUser(data.user), isLoading: false, isAuthenticated: true });
  }, []);

  const loginWithGoogle = useCallback(async (gData: GoogleLoginData) => {
    const res = await fetch(apiUrl("/api/v1/auth/google/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(gData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      if (!err) throw new Error("Backend server returned an invalid response. Migrations might be missing.");
      
      const errorMessage = err.detail || err.non_field_errors?.[0] || Object.entries(err).map(([k, v]) => `${k}: ${v}`).join(", ");
      throw new Error(errorMessage || "Google sign-in failed. Please try again.");
    }
    const data = await res.json();
    tokenStorage.set(data.access, data.refresh);
    setState({ user: mapRawUser(data.user), isLoading: false, isAuthenticated: true });
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    const res = await fetch(apiUrl("/api/v1/auth/otp/send/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.phone?.[0] || "Failed to send OTP.");
    }
    return await res.json();
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    const res = await fetch(apiUrl("/api/v1/auth/otp/verify/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.detail || err?.otp?.[0] || "Invalid OTP code.");
    }
    const data = await res.json();
    tokenStorage.set(data.access, data.refresh);
    setState({ user: mapRawUser(data.user), isLoading: false, isAuthenticated: true });
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const res = await fetch(apiUrl("/api/v1/auth/register/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      const msg = err?.email?.[0] || err?.password?.[0] || err?.detail || "Registration failed";
      throw new Error(msg);
    }
    const resData = await res.json();
    tokenStorage.set(resData.access, resData.refresh);
    setState({ user: mapRawUser(resData.user), isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    const access = tokenStorage.getAccess();
    try {
      await fetch(apiUrl("/api/v1/auth/logout/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // ignore
    }
    tokenStorage.clear();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        loginWithGoogle,
        sendOtp,
        verifyOtp,
        logout,
        refreshUser: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
