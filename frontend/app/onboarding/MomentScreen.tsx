import type { ReactNode } from "react";

import { BrandMark } from "../components/DesignPrimitives";
import { Icon, IconName } from "./Icon";

// Full-screen frame for the standalone "moment" screens (submit, saved,
// invitation). The "alongside" logo sits at the top, then a centred calm column.
export function Screen({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        height: "100dvh",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: "0 0 auto",
          padding: "18px 24px",
          borderBottom: "2px solid var(--line)",
        }}
      >
        <BrandMark small />
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            margin: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// The "quiet space is open" calm card — shared by the submit and saved screens.
// Ported from StateFinding in wf-invitations.jsx.
export function QuietSpaceCard({
  heading = "In the meantime…",
  sub = "the quiet space is open right now",
  onEnter,
}: {
  heading?: string;
  sub?: string;
  onEnter?: () => void;
}) {
  return (
    <div
      className="sk v2"
      style={{
        borderColor: "var(--calm)",
        background: "var(--calm-soft)",
        padding: "14px 16px",
        marginTop: 20,
        textAlign: "left",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name={IconName.Quiet} size={28} c="var(--calm)" />
        <div>
          <div className="h-title" style={{ fontSize: 17, color: "#3c5a4c" }}>
            {heading}
          </div>
          <div style={{ fontSize: 13, color: "#5d7568" }}>{sub}</div>
        </div>
        <div style={{ flex: 1 }} />
        <button
          type="button"
          className="btn calm"
          style={{ fontSize: 13 }}
          onClick={onEnter}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
