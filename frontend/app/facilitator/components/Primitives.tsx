// Facilitator-view primitives — sketchy hand-drawn building blocks.
//
// These mirror the participant app's DesignPrimitives.tsx (BrandMark / AvatarCircle /
// LineIcon) but the facilitator design needs a far richer icon set and a couple of extra
// avatar props, so it gets its own self-contained module. Styling reuses the shared
// classes in globals.css (.av, .chip, .leader, .divider, .h-title, .scrawl, .cap…).

import { CSSProperties, ReactNode } from "react";
import type { Tone } from "../lib/data";

// ----------------------------------------------------------------- icons
export type IconName =
  | "people"
  | "person"
  | "clock"
  | "mail"
  | "send"
  | "quiet"
  | "chev"
  | "chevd"
  | "chevu"
  | "back"
  | "plus"
  | "minus"
  | "check"
  | "x"
  | "heart"
  | "leaf"
  | "cal"
  | "dots"
  | "search"
  | "pen"
  | "settings"
  | "spark"
  | "note"
  | "bubble"
  | "bubbleLines"
  | "lock"
  | "inbox"
  | "sun"
  | "handshake"
  | "eye"
  | "pause"
  | "home"
  | "mug"
  | "paw"
  | "music"
  | "palette";

export function Icon({
  name,
  size = 20,
  c = "currentColor",
  sw = 1.8,
  style,
}: {
  name: IconName;
  size?: number;
  c?: string;
  sw?: number;
  style?: CSSProperties;
}) {
  const p = {
    fill: "none",
    stroke: c,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, ReactNode> = {
    people: (
      <>
        <circle {...p} cx="8" cy="8" r="3" />
        <path {...p} d="M2.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <path {...p} d="M15 6.2a3 3 0 0 1 0 5.6M16 13.5c2.4.5 4 2.4 4 4.5" />
      </>
    ),
    person: (
      <>
        <circle {...p} cx="11" cy="8" r="3.4" />
        <path {...p} d="M4.5 18.5c0-3.4 2.9-5.5 6.5-5.5s6.5 2.1 6.5 5.5" />
      </>
    ),
    clock: (
      <>
        <circle {...p} cx="11" cy="11" r="8" />
        <path {...p} d="M11 6.5V11l3 2" />
      </>
    ),
    mail: (
      <>
        <rect {...p} x="3" y="5" width="16" height="12" rx="2.5" />
        <path {...p} d="M4 7l7 5 7-5" />
      </>
    ),
    send: <path {...p} d="M19 4 9.5 13.5M19 4l-6 15-3.5-7.5L2 8z" />,
    quiet: (
      <>
        <circle {...p} cx="11" cy="11" r="2.6" />
        <circle {...p} cx="11" cy="11" r="6" opacity="0.6" />
        <circle {...p} cx="11" cy="11" r="9" opacity="0.32" />
      </>
    ),
    chev: <path {...p} d="M8 4l5 6-5 6" />,
    chevd: <path {...p} d="M5 8l6 5 6-5" />,
    chevu: <path {...p} d="M5 14l6-5 6 5" />,
    back: <path {...p} d="M13 4l-5 6 5 6" />,
    plus: <path {...p} d="M11 4v14M4 11h14" />,
    minus: <path {...p} d="M4 11h14" />,
    check: <path {...p} d="M4 11l5 5 9-11" />,
    x: <path {...p} d="M5 5l12 12M17 5L5 17" />,
    heart: <path {...p} d="M11 18S3.5 13 3.5 8.2A3.7 3.7 0 0 1 11 6a3.7 3.7 0 0 1 7.5 2.2C18.5 13 11 18 11 18Z" />,
    leaf: (
      <>
        <path {...p} d="M18 4C9 4 4 8.5 4 14c0 2 1 3.5 1 3.5S16 17 18 4Z" />
        <path {...p} d="M5 17.5C8 12 12 9 16 7.5" />
      </>
    ),
    cal: (
      <>
        <rect {...p} x="3" y="4.5" width="16" height="14.5" rx="2.5" />
        <path {...p} d="M3 8.5h16M7 2.5v4M15 2.5v4" />
      </>
    ),
    dots: (
      <>
        <circle cx="5" cy="11" r="1.5" fill={c} stroke="none" />
        <circle cx="11" cy="11" r="1.5" fill={c} stroke="none" />
        <circle cx="17" cy="11" r="1.5" fill={c} stroke="none" />
      </>
    ),
    search: (
      <>
        <circle {...p} cx="9.5" cy="9.5" r="6" />
        <path {...p} d="M14 14l4.5 4.5" />
      </>
    ),
    pen: <path {...p} d="M4 18l1-3.5L14 5.5l3 3L8 17.5 4 18ZM12 7.5l3 3" />,
    settings: (
      <>
        <circle {...p} cx="11" cy="11" r="2.6" />
        <path
          {...p}
          d="M11 2.5v2.4M11 17.1v2.4M19.5 11h-2.4M4.9 11H2.5M17 5l-1.7 1.7M6.7 15.3 5 17M17 17l-1.7-1.7M6.7 6.7 5 5"
        />
      </>
    ),
    spark: <path {...p} d="M11 3c.6 4 1.9 5.3 6 6-4.1.7-5.4 2-6 6-.6-4-1.9-5.3-6-6 4.1-.7 5.4-2 6-6Z" />,
    note: (
      <>
        <rect {...p} x="4" y="3.5" width="14" height="15" rx="2.5" />
        <path {...p} d="M7.5 8h7M7.5 11.5h7M7.5 15h4" />
      </>
    ),
    bubble: <path {...p} d="M3.5 5.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 3.5V14.5a2 2 0 0 1-.5-1.3z" />,
    bubbleLines: (
      <>
        <path {...p} d="M3.5 5.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 3.5V14.5a2 2 0 0 1-.5-1.3z" />
        <path {...p} d="M7 8h8M7 11h5" />
      </>
    ),
    lock: (
      <>
        <rect {...p} x="4.5" y="9.5" width="13" height="9" rx="2.4" />
        <path {...p} d="M7.5 9.5V7a3.5 3.5 0 0 1 7 0v2.5" />
      </>
    ),
    inbox: (
      <>
        <path {...p} d="M3.5 12.5 6 5.5a2 2 0 0 1 1.9-1.3h6.2A2 2 0 0 1 16 5.5l2.5 7" />
        <path {...p} d="M3.5 12.5h4l1.2 2.2h4.6l1.2-2.2h4v4a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z" />
      </>
    ),
    sun: (
      <>
        <circle {...p} cx="11" cy="11" r="3.6" />
        <path
          {...p}
          d="M11 2.6v2M11 17.4v2M2.6 11h2M17.4 11h2M5 5l1.4 1.4M15.6 15.6 17 17M17 5l-1.4 1.4M6.4 15.6 5 17"
        />
      </>
    ),
    handshake: (
      <>
        <path {...p} d="M3 8.5 7 6l4 2 3-1.5 4 2.5" />
        <path
          {...p}
          d="M11 8l-2.5 2.4a1.4 1.4 0 0 0 2 2l.6-.6.8.8a1.3 1.3 0 0 0 1.9-1.8l.5.5a1.3 1.3 0 0 0 1.9-1.8L14 7.5"
        />
      </>
    ),
    eye: (
      <>
        <path {...p} d="M2 11s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
        <circle {...p} cx="11" cy="11" r="2.6" />
      </>
    ),
    pause: (
      <>
        <rect {...p} x="6.5" y="5" width="3" height="12" rx="1" />
        <rect {...p} x="12.5" y="5" width="3" height="12" rx="1" />
      </>
    ),
    home: (
      <>
        <path {...p} d="M3 9.5 11 3l8 6.5" />
        <path {...p} d="M5 9v9h12V9" />
      </>
    ),
    mug: (
      <>
        <path {...p} d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
        <path {...p} d="M16 9.5h1.5a2 2 0 0 1 0 4H16" />
        <path {...p} d="M8 3.2v2M11.5 3.2v2" />
      </>
    ),
    paw: (
      <>
        <circle {...p} cx="6" cy="8" r="1.8" />
        <circle {...p} cx="11" cy="6.5" r="1.8" />
        <circle {...p} cx="16" cy="8" r="1.8" />
        <path
          {...p}
          d="M11 10c-2.6 0-4.5 2-4.5 4.2 0 1.6 1.4 2.3 2.6 1.7 1.2-.6 2.6-.6 3.8 0 1.2.6 2.6-.1 2.6-1.7C15.5 12 13.6 10 11 10Z"
        />
      </>
    ),
    music: (
      <>
        <path {...p} d="M8 16V5l9-2v11" />
        <circle {...p} cx="6" cy="16" r="2" />
        <circle {...p} cx="15" cy="14" r="2" />
      </>
    ),
    palette: (
      <>
        <path {...p} d="M11 3a8 8 0 1 0 0 16c1.2 0 1.6-1 1-1.8-.7-1 .1-2.2 1.3-2.2H16a3 3 0 0 0 3-3c0-4.4-3.6-7-8-7Z" />
        <circle cx="7.5" cy="9" r="1" fill={c} stroke="none" />
        <circle cx="11" cy="6.5" r="1" fill={c} stroke="none" />
        <circle cx="14.5" cy="9" r="1" fill={c} stroke="none" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      aria-hidden="true"
      style={{ display: "block", flex: "0 0 auto", ...style }}
    >
      {paths[name]}
    </svg>
  );
}

// ----------------------------------------------------------------- logo mark
export function Logo({
  size = 30,
  withWord = true,
  word = "alongside",
}: {
  size?: number;
  withWord?: boolean;
  word?: string;
}) {
  return (
    <div className="flex items-center" style={{ gap: 9 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "2.2px solid var(--ink)",
          position: "relative",
          flex: "0 0 auto",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: size * 0.13,
            borderRadius: "50%",
            border: "1.6px solid var(--warm)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: size * 0.3,
            borderRadius: "50%",
            background: "var(--warm)",
          }}
        />
      </div>
      {withWord && (
        <span className="h-title" style={{ fontSize: size * 0.82, color: "var(--ink)" }}>
          {word}
        </span>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- avatars
export function Avatar({
  name = "",
  size = 38,
  tone = "warm",
  dim = false,
  you = false,
  onClick,
  title,
}: {
  name?: string;
  size?: number;
  tone?: Tone;
  dim?: boolean;
  you?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  const cls = "av" + (tone === "calm" ? " calm" : tone === "sky" ? " sky" : "") + (dim ? " dim" : "");
  return (
    <div
      className={cls}
      title={title || name}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        cursor: onClick ? "pointer" : "default",
        boxShadow: you ? "0 0 0 2.5px var(--paper), 0 0 0 4.5px var(--warm)" : "none",
      }}
    >
      {(name[0] || "·").toUpperCase()}
    </div>
  );
}

export function AvatarRow({
  people = [],
  size = 34,
  max = 6,
  overlap = 9,
  onAvatar,
}: {
  people?: { name: string; tone?: Tone; id?: number }[];
  size?: number;
  max?: number;
  overlap?: number;
  onAvatar?: (p: { name: string; tone?: Tone; id?: number }) => void;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((person, i) => (
        <div key={i} style={{ marginLeft: i ? -overlap : 0 }}>
          <Avatar
            name={person.name}
            size={size}
            tone={person.tone}
            onClick={onAvatar ? () => onAvatar(person) : undefined}
          />
        </div>
      ))}
      {extra > 0 && (
        <div className="av anon" style={{ width: size, height: size, marginLeft: -overlap, fontSize: size * 0.34 }}>
          +{extra}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- room chrome
// The signature chatroom header — reused (with a facilitator twist) across rooms.
export function RoomHeader({
  room = "Friday Group",
  here = "7 here with you",
  mins = "30 mins together",
  right,
  eyebrow = "tonight's room",
}: {
  room?: string;
  here?: string;
  mins?: string;
  right?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="flex items-center" style={{ padding: "16px 28px", gap: 20 }}>
      <Logo size={28} />
      <div style={{ width: 0, height: 36, borderLeft: "2px dashed var(--line)" }} />
      <div className="flex flex-col" style={{ gap: 1, flex: "0 0 auto" }}>
        <span className="leader">{eyebrow}</span>
        <span className="h-title" style={{ fontSize: 27, color: "var(--ink)", whiteSpace: "nowrap" }}>
          {room}
        </span>
      </div>
      <div className="flex items-center" style={{ gap: 10, marginLeft: 10 }}>
        {here && (
          <span className="chip">
            <Icon name="people" size={16} c="var(--muted)" /> {here}
          </span>
        )}
        {mins && (
          <span className="chip">
            <Icon name="clock" size={16} c="var(--muted)" /> {mins}
          </span>
        )}
      </div>
      <div style={{ flex: 1 }} />
      {right}
    </div>
  );
}

// dashed separator
export function DashRule({ style }: { style?: CSSProperties }) {
  return <div className="divider" style={style} />;
}

// mono eyebrow label
export function SoftLabel({
  children,
  c = "var(--muted)",
  style,
}: {
  children: ReactNode;
  c?: string;
  style?: CSSProperties;
}) {
  return (
    <div className="leader" style={{ color: c, ...style }}>
      {children}
    </div>
  );
}

// a labelled value (used in profiles / onboarding results)
export function Field({
  label,
  children,
  accent,
}: {
  label: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex flex-col" style={{ gap: 4 }}>
      <span className="leader" style={{ color: accent || "var(--muted)" }}>
        {label}
      </span>
      <span style={{ fontSize: 17, color: "var(--ink)", lineHeight: 1.35 }}>{children}</span>
    </div>
  );
}

// the little "what happens if you press this" caption
export function Cap({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="cap" style={style}>
      {children}
    </div>
  );
}

// pull-quote for "in their own words"
export function Quote({
  children,
  by,
  accent = "var(--warm)",
}: {
  children: ReactNode;
  by?: string;
  accent?: string;
}) {
  return (
    <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 15 }}>
      <div className="h-title" style={{ fontSize: 25, color: "var(--ink)", lineHeight: 1.15 }}>
        “{children}”
      </div>
      {by && <div style={{ fontSize: 14.5, color: "var(--muted)", marginTop: 6 }}>{by}</div>}
    </div>
  );
}
