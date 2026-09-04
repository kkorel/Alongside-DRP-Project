import { ReflectionShareSelection } from "../../lib/types";

export function ShareReflectionDialog({
  mode,
  selection,
  canSend,
  disabled,
  onSelectionChange,
  onCancel,
  onSend,
}: {
  mode: "text" | "doodle";
  selection: ReflectionShareSelection;
  canSend: boolean;
  disabled: boolean;
  onSelectionChange: (selection: ReflectionShareSelection) => void;
  onCancel: () => void;
  onSend: () => void | Promise<void>;
}) {
  const isDoodle = mode === "doodle";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(58,52,45,0.22)] px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-reflection-title"
        className="sk w-full max-w-sm bg-card p-6 shadow-[0_24px_80px_rgba(58,52,45,0.24)] animate-fadeIn"
      >
        <div className="space-y-1.5">
          <h3
            id="share-reflection-title"
            className="h-title text-2xl text-ink"
          >
            {isDoodle ? "Share this doodle" : "Share with the facilitator"}
          </h3>
          <p className="text-[15px] leading-relaxed text-muted">
            {isDoodle
              ? "Your facilitator will see this drawing. Nothing else is shared, and there's no rush."
              : "Choose what you'd like to share. Everything else stays private to you."}
          </p>
        </div>

        {!isDoodle && (
          <div className="mt-5 space-y-3">
            <ShareCheckbox
              label="Guided answers"
              checked={selection.guidedAnswers}
              disabled={disabled}
              onChange={(checked) =>
                onSelectionChange({ ...selection, guidedAnswers: checked })
              }
            />

            <ShareCheckbox
              label="Free writing"
              checked={selection.freeWriting}
              disabled={disabled}
              onChange={(checked) =>
                onSelectionChange({ ...selection, freeWriting: checked })
              }
            />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="btn ghost sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !canSend}
            className="btn calm sm"
          >
            {disabled ? "Sharing…" : "Share"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ShareCheckbox({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="sk thin soft flex cursor-pointer items-center gap-3 bg-paper px-3.5 py-3 text-sm text-ink transition hover:[border-color:var(--calm)] has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-line accent-[var(--calm)] focus:ring-calm"
      />
      <span className="font-medium text-ink">{label}</span>
    </label>
  );
}