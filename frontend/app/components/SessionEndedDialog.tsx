import { LineIcon } from "./DesignPrimitives";

// Shown when the facilitator closes the session and everyone is gently returned home. The
// group chat is over, but the quiet space and private messaging are still there for them.
// Same overlay shape as ShareReflectionDialog so it feels native to the rest of the app.
export function SessionEndedDialog({
  facilitatorName,
  onContinue,
}: {
  facilitatorName: string;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,52,45,0.22)] px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-ended-title"
        className="sk w-full max-w-md bg-card p-6 shadow-[0_24px_80px_rgba(58,52,45,0.24)] animate-fadeIn"
      >
        <div className="flex items-start gap-3">
          <LineIcon
            name="quiet"
            size={26}
            className="mt-0.5 shrink-0 [color:var(--calm)]"
          />
          <div className="space-y-1.5">
            <h3 id="session-ended-title" className="h-title text-2xl text-ink">
              The session has ended
            </h3>
            <p className="text-[15px] leading-relaxed text-muted">
              {facilitatorName} has ended the meeting for now. In the meantime you
              can step into the quiet space to reflect, or message {facilitatorName}{" "}
              privately.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onContinue}
            className="btn calm w-full justify-center"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
