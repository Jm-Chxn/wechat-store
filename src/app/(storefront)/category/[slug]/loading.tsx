export default function CategoryLoading() {
  return (
    <div className="container py-8 bg-[#FAF8F3] min-h-screen">
      {/* Breadcrumb placeholder */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Title + sort row */}
      <div className="mb-6 flex items-end justify-between gap-3">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-9 w-36 animate-pulse rounded-xl bg-gray-200" />
      </div>

      {/* Two-column layout: sidebar + grid */}
      <div className="grid gap-6 md:grid-cols-[260px,1fr]">
        {/* Filter sidebar placeholder */}
        <div className="space-y-4">
          <div className="h-6 w-24 animate-pulse rounded-xl bg-gray-200" />
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 w-full animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
          <div className="h-px w-full bg-gray-200" />
          <div className="h-6 w-20 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-px w-full bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded-xl bg-gray-200" />
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-8 w-full animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Product grid placeholder — 8 cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-gray-200">
              <div className="aspect-square w-full rounded-t-2xl bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded-xl bg-gray-300" />
                <div className="h-3 w-1/2 rounded-xl bg-gray-300" />
                <div className="mt-2 h-8 w-full rounded-xl bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
