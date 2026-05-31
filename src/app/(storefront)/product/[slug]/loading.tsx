export default function ProductLoading() {
  return (
    <div className="container py-8 bg-[#FAF8F3] min-h-screen">
      {/* Breadcrumb placeholder */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-3 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Two-column product layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: large image placeholder */}
        <div className="overflow-hidden rounded-2xl bg-gray-200">
          <div className="aspect-square w-full animate-pulse bg-gray-200" />
        </div>

        {/* Right: product details */}
        <div className="space-y-5">
          {/* Badges row */}
          <div className="flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-6 w-20 animate-pulse rounded-xl bg-gray-200" />
          </div>

          {/* Title block */}
          <div className="space-y-2">
            <div className="h-9 w-3/4 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Price */}
          <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-200" />

          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200" />
          </div>

          {/* Qty + buttons row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 w-32 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-10 w-36 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-10 w-28 animate-pulse rounded-xl bg-gray-200" />
          </div>

          {/* Accordion placeholder */}
          <div className="space-y-2 rounded-2xl border border-gray-200 p-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      <div className="mt-14">
        <div className="mb-4 h-7 w-48 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-gray-200">
              <div className="aspect-square w-full rounded-t-2xl bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 rounded-xl bg-gray-300" />
                <div className="h-3 w-1/2 rounded-xl bg-gray-300" />
                <div className="h-8 w-full rounded-xl bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
