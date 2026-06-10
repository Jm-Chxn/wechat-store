"use client";

export function OrderConfirmedSkeleton() {
  return (
    <div className="container max-w-3xl py-12">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-soft">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-secondary/70" />
        <div className="mx-auto mt-4 h-8 w-48 animate-pulse rounded bg-secondary/70" />
        <div className="mx-auto mt-2 h-4 w-64 animate-pulse rounded bg-secondary/50" />
        <div className="mx-auto mt-3 h-6 w-36 animate-pulse rounded-full bg-secondary/60" />
      </div>
      <section className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-secondary/70" />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="h-12 animate-pulse rounded-xl bg-secondary/50" />
          <div className="h-12 animate-pulse rounded-xl bg-secondary/50" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-secondary/60" />
              <div className="h-4 flex-1 animate-pulse rounded bg-secondary/50" />
              <div className="h-4 w-14 animate-pulse rounded bg-secondary/60" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


