export function GuidedReflectionFields({
  privateNote,
  facilitatorNote,
  disabled,
  onPrivateNoteChange,
  onFacilitatorNoteChange,
}: {
  privateNote: string;
  facilitatorNote: string;
  disabled: boolean;
  onPrivateNoteChange: (value: string) => void;
  onFacilitatorNoteChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <ReflectionTextarea
        id="privateNote"
        label="How are you feeling now?"
        rows={4}
        value={privateNote}
        disabled={disabled}
        onChange={onPrivateNoteChange}
      />

      <ReflectionTextarea
        id="facilitatorNote"
        label="What has made you come here today?"
        rows={4}
        value={facilitatorNote}
        disabled={disabled}
        onChange={onFacilitatorNoteChange}
      />
    </div>
  );
}

export function FreeWritingField({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <ReflectionTextarea
      id="freeWritingNote"
      label="Write freely"
      rows={10}
      placeholder="Start wherever you are..."
      value={value}
      disabled={disabled}
      onChange={onChange}
      className="min-h-[15rem]"
    />
  );
}

function ReflectionTextarea({
  id,
  label,
  rows,
  value,
  disabled,
  onChange,
  placeholder = "Type here...",
  className = "min-h-[96px]",
}: {
  id: string;
  label: string;
  rows: number;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold text-ink">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`field calm ${className} resize-none leading-relaxed`}
      />
    </div>
  );
}