export default function OrdersLoading() {
  return (
    <div className="container py-8 bg-[#FAF8F3] min-h-screen">
      {/* Page title */}
      <div className="mb-6 h-9 w-40 animate-pulse rounded-xl bg-gray-200" />

      {/* Order card placeholders */}
      <div className="space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className="flex justify-between gap-3">
              <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-16 animate-pulse rounded-xl bg-gray-200" />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="h-14 animate-pulse rounded-xl bg-gray-200" />
              <div className="h-14 animate-pulse rounded-xl bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
