"use client";

import { useState, type ReactNode } from "react";

import { Icon, IconName } from "./Icon";

// Interactive ports of the design's presentational question parts (wf-survey.jsx).
// The look is faithful; the wiring is real controlled inputs / buttons.

const VARY = ["", "v2", "v3"] as const;

// Prominent "optional · skip freely" / "we'll need this one" markers, shown next
// to a question (never on a section heading).
function OptionalTag() {
  return (
    <span className="opt-badge">
      <span className="dot" /> optional · skip freely
    </span>
  );
}
function NeededTag() {
  return (
    <span className="need-badge">
      <Icon name={IconName.Heart} size={13} c="var(--warm)" /> we’ll need this one
    </span>
  );
}

// "Why we ask" — a green vertical bar beside the reason, and (optionally) how the
// answer is used. Trauma-informed transparency.
export function WhyAsk({ why, use }: { why: string; use?: string }) {
  return (
    <div className="whyask">
      <span className="wbar" />
      <span>
        <b>Why we ask:</b> {why}
        {use && (
          <>
            {" "}
            <span style={{ color: "var(--ink)" }}>{use}</span>
          </>
        )}
      </span>
    </div>
  );
}

// A single question: title (+ optional/needed tag) and the "why we ask" block.
export function Qn({
  q,
  why,
  use,
  optional,
  needed,
  children,
}: {
  q: string;
  why?: string;
  use?: string;
  optional?: boolean;
  needed?: boolean;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: 44 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          flexWrap: "wrap",
          marginBottom: why ? 9 : 12,
        }}
      >
        <span className="h-title" style={{ fontSize: 25 }}>
          {q}
        </span>
        {optional && <OptionalTag />}
        {needed && <NeededTag />}
      </div>
      {why && (
        <div style={{ marginBottom: 14 }}>
          <WhyAsk why={why} use={use} />
        </div>
      )}
      {children}
    </div>
  );
}

// Section heading with the wavy hand-drawn underline (no optional/needed tag —
// those live on the questions themselves).
export function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ margin: "0 0 16px" }}>
      <span className="h-title uline" style={{ fontSize: 26 }}>
        {title}
      </span>
      {sub && (
        <div style={{ fontSize: 17, color: "var(--muted)", marginTop: 10 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export function NoRushNotice({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "11px 14px 11px 18px",
        background: "var(--calm-soft)",
        border: "1.6px solid var(--calm)",
        borderRadius: "16px 230px 16px 240px/230px 16px 240px 16px",
      }}
    >
      <Icon name={IconName.Mug} size={20} c="var(--calm)" />
      <span style={{ flex: 1, fontSize: 15, color: "#3c5a4c" }}>
        There’s no rush. You can stop whenever you need and pick this up later.
        Just click the button in the top right corner when you want a break, we’ll save your progress.
      </span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onDismiss}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1.6px solid var(--calm)",
          background: "transparent",
          color: "var(--calm)",
          cursor: "pointer",
          flex: "0 0 auto",
          transition: "background-color 0.14s ease, color 0.14s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "var(--calm)";
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--calm)";
        }}
      >
        <Icon name={IconName.X} size={14} c="currentColor" sw={2} />
      </button>
    </div>
  );
}


// ---- text inputs ----
export function TextField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="sk field">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function UnderlineField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="uinput">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

// A typed field that collects many free-text entries — type one and press
// Enter (or Add). Each becomes a removable chip. Used for the "Other" hobbies.
export function TagField({
  id,
  label,
  placeholder,
  values,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) {
      onChange([...values, v]);
    }
    setDraft("");
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div>
      {values.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 11,
            marginBottom: 12,
          }}
        >
          {values.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => remove(v)}
              title={`Remove “${v}”`}
              className="sk thin chip-opt sel"
              style={{ gap: 8 }}
            >
              {v}
              <span aria-hidden style={{ opacity: 0.85 }}>
                ×
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="uinput">
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <button
          type="button"
          className="btn ghost"
          style={{ fontSize: 14, padding: "5px 14px" }}
          onClick={add}
          disabled={!draft.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ---- stacked options (marker + colour) ----
export type Choice = {
  text: string;
  skip?: boolean;
};

export function Opt({
  text,
  selected,
  multi,
  skip,
  vary = 0,
  onClick,
}: {
  text: string;
  selected: boolean;
  multi?: boolean;
  skip?: boolean;
  vary?: number;
  onClick: () => void;
}) {
  const v = VARY[vary % 3];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`sk ${v} opt ${multi ? "multi" : "single"} ${
        selected ? "sel" : ""
      } ${skip ? "skip" : ""}`}
    >
      <span className="ind">
        {selected && <Icon name={IconName.Check} size={14} c="#fff" sw={2.6} />}
      </span>
      <span>{text}</span>
    </button>
  );
}

export function OptList({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {children}
    </div>
  );
}

// ---- inline chips (colour-only selection, no marker) ----
export function OptChips({
  items,
  isSelected,
  onToggle,
}: {
  items: Choice[];
  isSelected: (text: string) => boolean;
  onToggle: (text: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 11 }}>
      {items.map((o, i) => {
        const selected = isSelected(o.text);
        return (
          <button
            type="button"
            key={o.text}
            onClick={() => onToggle(o.text)}
            aria-pressed={selected}
            className={`sk thin soft ${VARY[i % 3]} chip-opt ${
              selected ? "sel" : ""
            } ${o.skip ? "skip" : ""}`}
          >
            {o.text}
          </button>
        );
      })}
    </div>
  );
}
