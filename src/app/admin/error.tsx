"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center bg-slate-900 rounded-2xl mx-4 my-8">
      <h2 className="text-2xl font-semibold text-white">Dashboard error</h2>
      <p className="max-w-md text-slate-400">
        An unexpected error occurred in the admin panel. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
