export default function CheckoutLoading() {
  return (
    <div className="container py-8 bg-[#FAF8F3] min-h-screen">
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-6 lg:grid-cols-[auto_1fr_380px]">
        {/* Title */}
        <div className="col-start-2 row-start-1 h-9 w-40 animate-pulse rounded-xl bg-gray-200" />

        {/* Back button placeholder */}
        <div className="col-start-1 row-start-2 h-9 w-24 animate-pulse rounded-xl bg-gray-200" />

        {/* Contact form placeholder */}
        <div className="col-start-2 row-start-2 space-y-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
              </div>
            ))}
            <div className="space-y-1.5 sm:col-span-2">
              <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
              <div className="h-10 w-full animate-pulse rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Order summary sidebar */}
        <div className="col-span-2 h-fit space-y-4 rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-1 lg:col-start-3 lg:row-start-1 lg:row-span-3">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
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
          <div className="space-y-2 border-t border-gray-200 pt-3">
            <div className="flex justify-between gap-2">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex justify-between gap-2">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-10 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex justify-between gap-2">
              <div className="h-5 w-10 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
