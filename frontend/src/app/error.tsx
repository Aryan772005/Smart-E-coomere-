"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/common/Logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="container-page flex flex-1 flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-danger/10 text-danger">
          <AlertTriangle className="h-10 w-10" aria-hidden="true" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          An unexpected error occurred. Please try again, or head back to the home page.
        </p>
        <div className="mt-8 flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" href="/" as="a">
            Back to home
          </Button>
        </div>
      </main>
    </div>
  );
}
