const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
} as const;

export const isServer = typeof window === "undefined";

export function apiUrl(path: string): string {
  return `${env.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export default env;
