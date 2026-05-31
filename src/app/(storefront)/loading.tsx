export default function StorefrontLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Hero banner placeholder */}
      <div className="animate-pulse rounded-xl bg-gray-200 mx-auto mt-4 h-[340px] max-w-7xl" />

      {/* Trust bar placeholder */}
      <div className="mx-auto mt-8 max-w-7xl px-4">
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-36 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>

      {/* Popular products strip */}
      <div className="mx-auto mt-10 max-w-7xl px-4">
        <div className="mb-4 h-7 w-48 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      {/* New arrivals row */}
      <div className="mx-auto mt-10 max-w-7xl px-4 pb-16">
        <div className="mb-4 h-7 w-40 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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
