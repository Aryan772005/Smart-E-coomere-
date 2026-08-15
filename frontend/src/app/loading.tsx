import { Skeleton } from "@/components/ui/Skeleton";
import { Logo } from "@/components/common/Logo";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo showText={false} />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
      <div className="container-page space-y-10 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-5">
            <Skeleton className="h-7 w-44 rounded-full" />
            <Skeleton className="h-12 w-full max-w-md" />
            <Skeleton className="h-6 w-full max-w-lg" />
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-12 w-44 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
          </div>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
