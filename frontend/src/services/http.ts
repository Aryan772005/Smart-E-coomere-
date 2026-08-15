import { apiUrl } from "@/config/env";
import { ApiError, type ApiErrorPayload } from "@/types/api";

const ACCESS_TOKEN_KEY = "reloqa_access_token";
const REFRESH_TOKEN_KEY = "reloqa_refresh_token";

export const tokenStorage = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(access: string, refresh: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  setAccess(access: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  },
  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  isFormData?: boolean;
  timeoutMs?: number;
  auth?: boolean;
  skipAuthRedirect?: boolean;
}

function normalizeParams(
  params?: RequestOptions["params"],
): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function parseErrorResponse(response: Response): Promise<ApiErrorPayload> {
  try {
    const data = await response.json();
    return data as ApiErrorPayload;
  } catch {
    return {
      code: "server_error",
      message: `Request failed with status ${response.status}.`,
    };
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshTokens(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(apiUrl("/api/v1/auth/token/refresh/"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!response.ok) return false;
        const data = (await response.json()) as { access: string; refresh?: string };
        tokenStorage.setAccess(data.access);
        if (data.refresh) {
          tokenStorage.set(data.access, data.refresh);
        }
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    params,
    headers: extraHeaders,
    isFormData = false,
    timeoutMs = 20_000,
    auth = true,
  } = options;

  const headers: Record<string, string> = { ...extraHeaders };
  if (!isFormData && body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth) {
    const accessToken = tokenStorage.getAccess();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  const controller = new AbortController();
  const timeout = typeof window !== "undefined"
    ? window.setTimeout(() => controller.abort(), timeoutMs)
    : setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${apiUrl(path)}${normalizeParams(params)}`, {
      method,
      headers,
      body: isFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      credentials: "include",
    });

    if (response.status === 401 && auth && !options.skipAuthRedirect) {
      const refreshed = await tryRefreshTokens();
      if (refreshed) {
        return request<T>(path, { ...options, skipAuthRedirect: true });
      }
      tokenStorage.clear();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("reloqa:auth-expired"));
      }
      throw new ApiError(401, { code: "unauthenticated", message: "Your session has expired. Please sign in again." });
    }

    if (!response.ok) {
      throw new ApiError(response.status, await parseErrorResponse(response));
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("Content-Type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    return (await response.text()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(408, { code: "timeout", message: "The request timed out. Please try again." });
    }
    throw new ApiError(0, {
      code: "network_error",
      message: "Unable to reach the server. Check your connection and try again.",
    });
  } finally {
    if (typeof window !== "undefined") {
      window.clearTimeout(timeout);
    } else {
      clearTimeout(timeout);
    }
  }
}

export const http = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body });
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PUT", body });
  },
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PATCH", body });
  },
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
