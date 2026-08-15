import { Compass } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/common/Logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="container-page flex flex-1 flex-col items-center justify-center py-20 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-soft text-brand">
          <Compass className="h-10 w-10" aria-hidden="true" />
        </div>
        <p className="mt-6 text-6xl font-extrabold tracking-tight text-foreground">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Page not found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button as={Link} href="/">
            Back to home
          </Button>
          <Button variant="outline" as={Link} href="/browse">
            Browse products
          </Button>
        </div>
      </main>
    </div>
  );
}
