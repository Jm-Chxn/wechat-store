"use client";

export function OrdersPageSkeleton() {
  return (
    <div className="container py-8">
      <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-secondary/70" />
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex justify-between gap-3">
              <div className="h-5 w-40 animate-pulse rounded bg-secondary/60" />
              <div className="h-5 w-16 animate-pulse rounded bg-secondary/50" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="h-14 animate-pulse rounded-xl bg-secondary/40" />
              <div className="h-14 animate-pulse rounded-xl bg-secondary/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
