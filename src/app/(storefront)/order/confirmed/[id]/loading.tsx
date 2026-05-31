export default function OrderConfirmedLoading() {
  return (
    <div className="container max-w-3xl py-12 bg-[#FAF8F3] min-h-screen">
      {/* Confirmation card placeholder */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
        {/* Success icon circle */}
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-gray-200" />
        {/* Title line */}
        <div className="mx-auto mt-4 h-7 w-48 animate-pulse rounded-xl bg-gray-200" />
        {/* Subtitle */}
        <div className="mx-auto mt-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
        {/* Order ID pill */}
        <div className="mx-auto mt-3 h-7 w-36 animate-pulse rounded-full bg-gray-200" />
      </div>

      {/* Order summary section */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
        <div className="mb-4 h-5 w-28 animate-pulse rounded bg-gray-200" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2 border-t border-gray-200 pt-3">
          <div className="flex justify-between gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex justify-between gap-2">
            <div className="h-5 w-10 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Action buttons row */}
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="h-10 w-36 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-10 w-40 animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
