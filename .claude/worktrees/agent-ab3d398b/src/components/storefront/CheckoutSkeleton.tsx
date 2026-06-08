"use client";

export function CheckoutSkeleton() {
  return (
    <div className="container py-8">
      <div className="mb-6 h-9 w-40 animate-pulse rounded-lg bg-secondary/70" />
      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
            <div className="h-4 w-28 animate-pulse rounded bg-secondary/70" />
            <div className="h-3 w-56 animate-pulse rounded bg-secondary/50" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-10 animate-pulse rounded-xl bg-secondary/60" />
              <div className="h-10 animate-pulse rounded-xl bg-secondary/60" />
              <div className="h-10 animate-pulse rounded-xl bg-secondary/60 sm:col-span-2" />
            </div>
          </div>
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-secondary/70" />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-10 animate-pulse rounded-xl bg-secondary/60 sm:col-span-2" />
              <div className="h-10 animate-pulse rounded-xl bg-secondary/60" />
              <div className="h-10 animate-pulse rounded-xl bg-secondary/60 sm:col-span-2" />
              <div className="h-10 animate-pulse rounded-xl bg-secondary/60 sm:col-span-2" />
            </div>
          </div>
        </div>
        <div className="h-fit space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="h-4 w-32 animate-pulse rounded bg-secondary/70" />
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-secondary/60" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-secondary/60" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-secondary/50" />
              </div>
              <div className="h-4 w-12 animate-pulse rounded bg-secondary/60" />
            </div>
          ))}
          <div className="space-y-2 border-t border-border pt-3">
            <div className="h-4 w-full animate-pulse rounded bg-secondary/50" />
            <div className="h-4 w-full animate-pulse rounded bg-secondary/50" />
            <div className="h-5 w-full animate-pulse rounded bg-secondary/70" />
          </div>
          <div className="h-11 w-full animate-pulse rounded-xl bg-secondary/70" />
        </div>
      </div>
    </div>
  );
}
