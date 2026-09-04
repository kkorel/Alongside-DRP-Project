import { ReactNode } from "react";

// A shared wrapper for every standalone quiet-space sub-page. It provides the
// sage-toned card, the calming header, and optional error display — the same
// visual shell as QuietReflectionRoom but without the tab list or back button
// (the sidebar handles navigation instead).

type QuietSpaceFrameProps = {
  /** Heading shown below the leader text. */
  heading?: string;
  /** Descriptive copy below the heading. */
  description?: string;
  /** Error message shown as a soft alert above the content. */
  error?: string;
  /** Optional action block rendered top-right (e.g. Share with facilitator). */
  action?: ReactNode;
  /** Let the content fill the wider panel — used by roomy tools like Doodle. */
  wide?: boolean;
  children: ReactNode;
};

export function QuietSpaceFrame({
  heading = "Quiet space to reflect",
  description = "Take a calm moment for yourself. You can write your thoughts down freely.",
  error,
  action,
  wide = false,
  children,
}: QuietSpaceFrameProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--calm-soft)] p-4 sm:p-5">
      <div className="panel relative flex min-h-full shrink-0 [border-color:var(--calm)] bg-card px-5 py-5 shadow-[0_18px_50px_rgba(58,52,45,0.10)] sm:px-7 sm:py-6">
        {/* The share action overlays the top-right corner so it doesn't reserve
            a row of height — keeping the heading aligned with tools that have
            no button (e.g. Breathe). */}
        {action && (
          <div className="absolute right-5 top-5 z-10 sm:right-7 sm:top-6">
            {action}
          </div>
        )}

        <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
          {/* On phones the overlaid button shares the top band, so drop the
              heading below it there; from sm up there's room beside it and the
              heading aligns with the no-button tools. */}
          <div className={`pt-1 text-center ${action ? "max-sm:pt-14" : ""}`}>
            <p className="leader [color:var(--calm)]">A space just for you</p>
            <h2 className="h-title uline mt-1 inline-block text-3xl text-[var(--calm-ink)]">
              {heading}
            </h2>
            <p className="mx-auto mt-3 flex max-w-md items-center justify-center gap-2 text-[15px] leading-relaxed text-muted">
              {description}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="sk thin soft bg-paper px-4 py-3 text-[15px] leading-relaxed text-warm-ink"
            >
              {error}
            </div>
          )}

          <div
            className={`mx-auto w-full space-y-5 ${wide ? "max-w-5xl" : "max-w-3xl"}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
