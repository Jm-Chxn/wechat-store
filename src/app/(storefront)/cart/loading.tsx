export default function CartLoading() {
  return (
    <div className="container py-8 bg-[#FAF8F3] min-h-screen">
      {/* Page title */}
      <div className="mb-6 h-9 w-24 animate-pulse rounded-xl bg-gray-200" />

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        {/* Cart item rows — 3 placeholders */}
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-3"
            >
              {/* Thumbnail */}
              <div className="h-24 w-24 shrink-0 animate-pulse rounded-xl bg-gray-200" />
              {/* Text + controls */}
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="h-9 w-28 animate-pulse rounded-xl bg-gray-200" />
                  <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
              {/* Price */}
              <div className="h-5 w-14 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Order summary sidebar */}
        <div className="h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="space-y-2">
            <div className="flex justify-between gap-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex justify-between gap-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex justify-between gap-2 border-t border-gray-200 pt-2">
              <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="h-9 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
