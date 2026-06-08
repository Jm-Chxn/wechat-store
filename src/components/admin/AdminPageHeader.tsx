import * as React from "react";

/**
 * Uniform page-level header used by every admin page.
 *
 * ┌─────────────────────────────────────────────────────┐
 * │ SECTION LABEL (small caps)          [right controls] │
 * │ Page Title                                           │
 * │ subtitle / count                                     │
 * └─────────────────────────────────────────────────────┘
 */
export function AdminPageHeader({
  section,
  title,
  subtitle,
  children,
}: {
  /** Small uppercase label rendered above the title */
  section: string;
  /** Main h1 text */
  title: string;
  /** Count string or loading note rendered below the title */
  subtitle?: string;
  /** Right-hand controls — search bars, filter dropdowns, action buttons */
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {section}
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </header>
  );
}
