export default function AccountLoading() {
  return (
    <div className="container py-8 bg-[#FAF8F3] min-h-screen">
      {/* Page title */}
      <div className="mb-6 h-9 w-36 animate-pulse rounded-xl bg-gray-200" />

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* Sidebar: avatar + info rows + action buttons */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-1.5">
              <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between gap-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-9 w-full animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Main section: welcome + recent orders */}
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="h-6 w-48 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
          <div className="space-y-3 pt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 p-3"
              >
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-5 w-20 animate-pulse rounded-xl bg-gray-200" />
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
