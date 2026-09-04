// The "alongside" logo mark — concentric circles + handwritten wordmark.
// Ported from the design's wf-shared.jsx.
type MarkProps = {
  small?: boolean;
};

export function Mark({ small = false }: MarkProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div
        style={{
          width: small ? 24 : 30,
          height: small ? 24 : 30,
          borderRadius: "50%",
          border: "2.2px solid var(--ink)",
          position: "relative",
          flex: "0 0 auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 4,
            borderRadius: "50%",
            border: "1.6px solid var(--warm)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 9,
            borderRadius: "50%",
            background: "var(--warm)",
          }}
        />
      </div>
      <span
        className="h-title"
        style={{ fontSize: small ? 20 : 24, color: "var(--ink)" }}
      >
        alongside
      </span>
    </div>
  );
}
