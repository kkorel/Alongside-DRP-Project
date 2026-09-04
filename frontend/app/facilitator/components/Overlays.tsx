"use client";

// fac view — the overlay/modal system, the summary profile pop-up, and the full profile.
//
// Clicking someone's picture opens the summary card (a glance); "See full profile" opens
// the complete read. Message & reflections live one tap behind the summary. Same sketchy
// style as every screen.

import { CSSProperties, ReactNode, useEffect, useState } from "react";
import { Avatar, Cap, DashRule, Field, Icon, IconName, SoftLabel } from "./Primitives";
import {
  LOST_ICON,
  lostLabel,
  personFromParticipant,
  sinceShort,
  type GroupCard,
  type Person,
} from "../lib/data";
import { apiBase, fetchParticipant } from "../lib/api";

// ----------------------------------------------------------------- overlay shell
export function Overlay({
  onClose,
  children,
  align = "center",
}: {
  onClose: () => void;
  children: ReactNode;
  align?: "center" | "top";
}) {
  return (
    <div className="ov" style={{ alignItems: align === "top" ? "flex-start" : "center" }} onClick={onClose}>
      <div className="pop" style={{ maxHeight: "100%" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="btn ghost icon" onClick={onClick} title="Close" style={{ borderColor: "var(--line)" }}>
      <Icon name="x" size={17} c="var(--muted)" />
    </button>
  );
}

// ----------------------------------------------------------------- little pieces
export function PopBlock({
  icon,
  label,
  accent = "var(--muted)",
  skin = "v2",
  children,
  tint,
}: {
  icon?: IconName;
  label: string;
  accent?: string;
  skin?: string;
  children: ReactNode;
  tint?: string;
}) {
  return (
    <div className={`sk ${skin} soft`} style={{ padding: "13px 16px", background: tint || "var(--card)" }}>
      <div className="row" style={{ gap: 7, marginBottom: 7 }}>
        {icon && <Icon name={icon} size={14} c={accent} />}
        <span className="leader" style={{ color: accent }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 16.5, color: "var(--ink)", lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

// "Who they lost" — a single category chip plus a time-since-bereaved chip. Never a
// category alongside their own words (the value is one or the other).
export function LostCategory({ m }: { m: Person }) {
  if (!m.lostCat) {
    return <span style={{ fontSize: 15.5, color: "var(--faint)" }}>they’d rather not say</span>;
  }
  return (
    <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>
      <span className="chip warm" style={{ fontSize: 15, padding: "6px 13px" }}>
        {lostLabel(m)}
      </span>
      {m.recency && (
        <span className="chip" style={{ fontSize: 13.5 }}>
          <Icon name="clock" size={13} c="var(--muted)" /> {m.recency.toLowerCase()}
        </span>
      )}
    </div>
  );
}

// One shared, quiet privacy note — same gentle treatment for messages and reflections.
export function PrivacyNote({ children, icon = "lock" }: { children: ReactNode; icon?: IconName }) {
  return (
    <div
      className="row"
      style={{ gap: 8, justifyContent: "center", marginBottom: 14, color: "var(--faint)", fontSize: 12.5, textAlign: "center" }}
    >
      <Icon name={icon} size={13} c="var(--faint)" /> {children}
    </div>
  );
}

// A group's "live" / "live soon" status badge — shown on cards, details and invite rails.
export function CircleBadge({ c, size = 13 }: { c: { live: boolean; liveSoon: boolean }; size?: number }) {
  if (c.live) {
    return (
      <span className="chip warm" style={{ fontSize: size }}>
        <span className="dot warm" style={{ width: 7, height: 7, animation: "pulse 1.6s infinite" }} /> live
      </span>
    );
  }
  if (c.liveSoon) {
    return (
      <span className="chip" style={{ fontSize: size, borderColor: "var(--warm)", color: "var(--warm-ink)" }}>
        <span className="dot warm" style={{ width: 7, height: 7 }} /> live soon
      </span>
    );
  }
  return null;
}

// The loss as a single gentle value (a category icon + label, or "—").
export function LostChip({ m, size = 15 }: { m: Person; size?: number }) {
  if (!m.lostCat) {
    return (
      <span className="chip" style={{ fontSize: size }}>
        —
      </span>
    );
  }
  const icon = LOST_ICON[m.lostCat];
  return (
    <span className="chip warm" style={{ fontSize: size, padding: "5px 12px" }}>
      {icon && <Icon name={icon} size={size} c="var(--warm-ink)" />} {lostLabel(m)}
    </span>
  );
}

export function HobbyChips({ items = [] }: { items?: string[] }) {
  return (
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      {items.map((h, i) => (
        <span key={i} className="chip calm" style={{ fontSize: 14.5, padding: "6px 12px" }}>
          {h}
        </span>
      ))}
    </div>
  );
}

function ProfileHeaderRow({
  m,
  group,
  onClose,
}: {
  m: Person;
  group?: string | null;
  onClose: () => void;
}) {
  const sub = m.joined ?? m.finished ?? "";
  return (
    <div className="row" style={{ padding: "20px 22px 16px", gap: 16, alignItems: "flex-start" }}>
      <Avatar name={m.name} size={62} tone={m.tone} />
      <div className="stack" style={{ gap: 4, flex: 1, paddingTop: 2 }}>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <h2 className="h-title" style={{ fontSize: 31, color: "var(--ink)" }}>
            {m.name}
          </h2>
          {group ? (
            <span className="chip" style={{ fontSize: 13, padding: "3px 10px" }}>
              <Icon name="people" size={13} c="var(--muted)" /> {group}
            </span>
          ) : (
            <span className="chip dash" style={{ fontSize: 13, padding: "3px 10px", color: "var(--faint)" }}>
              not placed yet
            </span>
          )}
        </div>
        <div className="row" style={{ gap: 8, color: "var(--muted)", fontSize: 15.5, flexWrap: "wrap" }}>
          {m.pronouns && <span>{m.pronouns}</span>}
          {m.pronouns && m.age && <span style={{ color: "var(--faint)" }}>·</span>}
          {m.age && <span>{m.age}</span>}
        </div>
        {sub && <span style={{ fontSize: 14.5, color: "var(--calm-ink)" }}>{sub}</span>}
      </div>
      <CloseBtn onClick={onClose} />
    </div>
  );
}

// ------------------------------------------------------------- THE SUMMARY POPUP
// Old version: a glance card with Message / Reflections buttons + "See full profile".
// Replaced by the 3-tab profile card (see Hub `variant="card"`). Kept here, commented
// out, so it can be restored if needed.
/*
export function ProfilePopup({
  person,
  group = null,
  onClose,
  onMessage,
  onReflections,
  onSeeMore,
}: {
  person: Person;
  group?: string | null;
  onClose: () => void;
  onMessage?: () => void;
  onReflections?: () => void;
  onSeeMore?: () => void;
}) {
  const m = person;
  return (
    <div
      className="sk"
      style={{
        width: 452,
        maxWidth: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <ProfileHeaderRow m={m} group={group} onClose={onClose} />

      <div className="scroll" style={{ padding: "4px 22px 20px" }}>
        <div className="stack" style={{ gap: 14 }}>
          {m.fact && (
            <PopBlock icon="spark" label="A fact about them" accent="var(--warm-ink)" skin="v3" tint="var(--warm-soft)">
              {m.fact}
            </PopBlock>
          )}

          <div className="stack" style={{ gap: 9 }}>
            <span className="leader">Hobbies</span>
            <HobbyChips items={m.hobbies} />
          </div>

          <Field label="Cultural background">
            {m.culture && m.culture !== "—" ? (
              m.culture
            ) : (
              <span style={{ color: "var(--faint)" }}>they’d rather not say</span>
            )}
          </Field>

          <DashRule />
          <div className="stack" style={{ gap: 9 }}>
            <span className="leader" style={{ color: "var(--warm-ink)" }}>
              What they’re carrying
            </span>
            <LostCategory m={m} />
          </div>
        </div>
      </div>

      <DashRule />
      <div className="stack" style={{ padding: "14px 22px 16px", gap: 11 }}>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn warm" style={{ flex: 1, justifyContent: "center" }} onClick={onMessage}>
            <Icon name="bubbleLines" size={17} c="#fff" /> Message
            {m.unread ? <span className="dot" style={{ background: "#fff" }} /> : null}
          </button>
          <button className="btn calm-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onReflections}>
            <Icon name="note" size={17} c="var(--calm-ink)" /> Reflections
            {m.reflectionNew ? <span className="dot sky" /> : null}
          </button>
        </div>
        {onSeeMore && (
          <button className="btn ghost" style={{ justifyContent: "center" }} onClick={onSeeMore}>
            <Icon name="eye" size={16} c="var(--muted)" /> See full profile
          </button>
        )}
      </div>
    </div>
  );
}
*/

// ----------------------------------------------------------------- THE FULL PROFILE
export function FullProfilePopup({
  person,
  group = null,
  onClose,
}: {
  person: Person;
  group?: string | null;
  onClose: () => void;
}) {
  const m = person;
  return (
    <div
      className="sk"
      style={{
        width: 480,
        maxWidth: "100%",
        maxHeight: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <ProfileHeaderRow m={m} group={group} onClose={onClose} />
      <DashRule />
      <div className="scroll" style={{ padding: "16px 22px 20px" }}>
        <div className="stack" style={{ gap: 16 }}>
          <div className="stack" style={{ gap: 9 }}>
            <span className="leader" style={{ color: "var(--warm-ink)" }}>
              What they’re carrying
            </span>
            <LostCategory m={m} />
          </div>
          {m.fact && (
            <PopBlock icon="spark" label="A fact about them" accent="var(--warm-ink)" skin="v2" tint="var(--warm-soft)">
              {m.fact}
            </PopBlock>
          )}
          <div className="stack" style={{ gap: 9 }}>
            <span className="leader">Hobbies</span>
            <HobbyChips items={m.hobbies} />
          </div>
          <Field label="Cultural background">
            {m.culture && m.culture !== "—" ? (
              m.culture
            ) : (
              <span style={{ color: "var(--faint)" }}>they’d rather not say</span>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- small menu popup
export type MenuItem = { icon: IconName; label: string; onClick?: () => void; danger?: boolean };

export function MenuPopup({ title, items = [] }: { title?: string; items?: MenuItem[]; onClose?: () => void }) {
  return (
    <div
      className="sk v3"
      style={{ width: 256, background: "var(--card)", overflow: "hidden", boxShadow: "0 16px 44px rgba(58,45,30,.18)" }}
    >
      {title && (
        <div className="leader" style={{ padding: "14px 16px 8px" }}>
          {title}
        </div>
      )}
      <div className="stack" style={{ padding: "4px 8px 10px", gap: 2 }}>
        {items.map((it, i) => (
          <div
            key={i}
            className="row"
            onClick={() => it.onClick && it.onClick()}
            style={{
              gap: 11,
              padding: "10px 12px",
              borderRadius: 12,
              cursor: "pointer",
              color: it.danger ? "var(--warm-ink)" : "var(--ink)",
              fontSize: 16,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--warm-soft)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Icon name={it.icon} size={17} c={it.danger ? "var(--warm)" : "var(--muted)"} />
            <span style={{ flex: 1 }}>{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- confirm dialog
export function ConfirmPopup({
  icon = "leaf",
  accent = "var(--warm)",
  title,
  body,
  confirm = "Confirm",
  cancel = "Never mind",
  caption,
  onClose,
  onConfirm,
}: {
  icon?: IconName;
  accent?: string;
  title: string;
  body: string;
  confirm?: string;
  cancel?: string | null;
  caption?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  // A single-action popup (cancel === null) shows just one centred button — used when
  // there's nothing to cancel, only an acknowledgement that moves you onward.
  const single = cancel === null;
  return (
    <div
      className="sk"
      style={{ width: 420, background: "var(--paper)", padding: "24px 26px", boxShadow: "0 18px 50px rgba(58,45,30,.20)" }}
    >
      <div className="row" style={{ gap: 13, marginBottom: 13 }}>
        <div className="av" style={{ width: 46, height: 46, background: "var(--card)", borderColor: accent }}>
          <Icon name={icon} size={24} c={accent} />
        </div>
        <h3 className="h-title" style={{ fontSize: 25, color: "var(--ink)", flex: 1 }}>
          {title}
        </h3>
      </div>
      <p style={{ fontSize: 16.5, color: "var(--ink)", lineHeight: 1.45, marginBottom: 18 }}>{body}</p>
      <div className="row" style={{ gap: 11 }}>
        {!single && (
          <>
            <button className="btn ghost" onClick={onClose}>
              {cancel}
            </button>
            <div style={{ flex: 1 }} />
          </>
        )}
        <button
          className="btn accent-fill"
          style={{ "--accent": accent, ...(single ? { flex: 1, justifyContent: "center" } : {}) } as CSSProperties}
          onClick={onConfirm}
        >
          {confirm}
        </button>
      </div>
      {caption && <Cap style={{ marginTop: 13 }}>{caption}</Cap>}
    </div>
  );
}

// ----------------------------------------------------------------- group details popup
// Who's inside a group + its feel. Opened from a card's "Details" and from the eye on a
// group-invite card. Tap a participant to read their full profile; the footer invites
// someone new in. Member detail (loss/age) isn't on the group payload, so each member's
// full profile is fetched on open via the existing participant endpoint.
export function GroupDetailsPopup({
  group,
  onClose,
  onInvite,
  onParticipant,
  onSeeEveryone,
}: {
  group: GroupCard;
  onClose: () => void;
  onInvite?: () => void;
  onParticipant?: (p: Person) => void;
  onSeeEveryone?: () => void;
}) {
  const apiUrl = apiBase();
  const [people, setPeople] = useState<Person[] | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all(group.members.map((m) => fetchParticipant(apiUrl, m.id)))
      .then((ps) => {
        if (active) setPeople(ps.map(personFromParticipant));
      })
      .catch(() => {
        if (active) setPeople([]);
      });
    return () => {
      active = false;
    };
  }, [apiUrl, group.groupId, group.members]);

  const count = group.members.length;
  return (
    <div
      className="sk"
      style={{
        width: 460,
        maxWidth: "100%",
        maxHeight: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <div className="row" style={{ padding: "20px 22px 14px", gap: 14, alignItems: "flex-start" }}>
        <div className="av" style={{ width: 48, height: 48, background: "var(--warm-soft)", borderColor: "var(--warm)" }}>
          <Icon name="people" size={24} c="var(--warm)" />
        </div>
        <div className="stack" style={{ gap: 4, flex: 1, paddingTop: 1 }}>
          <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>
            <h2 className="h-title" style={{ fontSize: 26, color: "var(--ink)" }}>
              {group.name}
            </h2>
            <CircleBadge c={group} />
          </div>
          <span style={{ fontSize: 14.5, color: "var(--muted)" }}>
            {group.when}
            {group.durationMinutes != null ? ` · ${group.durationMinutes} min` : ""} · {count}{" "}
            {count === 1 ? "person" : "people"}
          </span>
        </div>
        <CloseBtn onClick={onClose} />
      </div>
      <DashRule />
      <div className="scroll" style={{ padding: "16px 22px" }}>
        {group.description && (
          <p style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1.5, marginBottom: 16 }}>{group.description}</p>
        )}
        <div className="row" style={{ gap: 10, marginBottom: 11, alignItems: "baseline" }}>
          <SoftLabel>Who’s in this group · tap to read their profile</SoftLabel>
          {onSeeEveryone && (
            <>
              <div style={{ flex: 1 }} />
              <span className="wavy" style={{ fontSize: 13.5, color: "var(--warm-ink)" }} onClick={onSeeEveryone}>
                See everyone →
              </span>
            </>
          )}
        </div>
        {people === null ? (
          <span style={{ fontSize: 14, color: "var(--muted)" }}>Loading…</span>
        ) : people.length === 0 ? (
          <span style={{ fontSize: 14, color: "var(--faint)" }}>No one is in this group yet.</span>
        ) : (
          <div className="stack" style={{ gap: 9 }}>
            {people.map((p) => (
              <div
                key={p.id}
                className="sk thin soft"
                onClick={() => onParticipant && onParticipant(p)}
                style={{ padding: "10px 13px", display: "flex", alignItems: "center", gap: 11, cursor: onParticipant ? "pointer" : "default" }}
              >
                <Avatar name={p.name} size={36} tone={p.tone} />
                <div className="stack" style={{ gap: 1, flex: 1, minWidth: 0 }}>
                  <span className="h-title" style={{ fontSize: 17, color: "var(--ink)" }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {[lostLabel(p), p.age].filter(Boolean).join(" · ") || "—"}
                  </span>
                </div>
                {onParticipant && <Icon name="chev" size={15} c="var(--faint)" />}
              </div>
            ))}
          </div>
        )}
      </div>
      {onInvite && (
        <>
          <DashRule />
          <div className="row" style={{ padding: "13px 22px" }}>
            <div style={{ flex: 1 }} />
            <button className="btn warm" onClick={onInvite}>
              <Icon name="mail" size={16} c="#fff" /> Add someone
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// An overlapping face that lifts and reveals its name on hover, then opens the member's
// profile — mirrors the dashboard card's HoverFace (kept local to avoid an import cycle
// with Groups.tsx, which already imports ArrivalRow from Onboarding).
function HoverFace({ name, tone, onClick }: { name: string; tone: Person["tone"]; onClick: () => void }) {
  return (
    <div className="relative w-fit" style={{ marginLeft: -9 }}>
      <button
        type="button"
        onClick={onClick}
        className="peer fac-tap rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm"
        aria-label={`Open ${name}'s profile`}
      >
        <Avatar name={name} size={36} tone={tone} />
      </button>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-95 peer-hover:opacity-100 peer-hover:scale-100 transition-all duration-200 ease-out z-50 px-3 py-2 sk thin soft bg-card shadow-[0_8px_24px_rgba(68,52,35,0.12)] whitespace-nowrap text-xs leading-normal text-ink text-center block">
        {name}
      </span>
    </div>
  );
}

// A group as a placing target (used in the arrival full page's right rail). Mirrors the
// dashboard's GroupCard format — name + badge, schedule/people, overlapping member faces —
// but its primary action invites this person in, with "Group details" opening the full
// popup. No "open the room / next session" slot and no notes button.
export function GroupPlaceCard({
  c,
  personName,
  onInvite,
  onDetails,
  onAvatar,
}: {
  c: GroupCard;
  personName: string;
  onInvite: () => void;
  onDetails: () => void;
  onAvatar: (id: number) => void;
}) {
  const liveish = c.live || c.liveSoon;
  return (
    <div
      className="sk"
      style={{
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        borderColor: liveish ? "var(--warm)" : "var(--ink)",
        boxShadow: liveish ? "0 5px 0 -1px var(--warm-soft)" : "none",
      }}
    >
      <div className="stack" style={{ gap: 5 }}>
        <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>
          <h3 className="h-title" style={{ fontSize: 21, color: "var(--ink)" }}>
            {c.name}
          </h3>
          <CircleBadge c={c} />
        </div>
        <span className="row" style={{ gap: 8, fontSize: 14, color: "var(--muted)" }}>
          <Icon name="clock" size={15} c="var(--muted)" /> {c.when}
          {c.durationMinutes != null && <span>· {c.durationMinutes} min</span>}
          ·<Icon name="people" size={14} c="var(--muted)" /> {c.members.length}
        </span>
      </div>

      <div className="row" style={{ gap: 12 }}>
        {c.members.length > 0 ? (
          <div className="flex items-center" style={{ paddingLeft: 9 }}>
            {c.members.map((mem) => (
              <HoverFace key={mem.id} name={mem.name} tone={mem.tone} onClick={() => onAvatar(mem.id)} />
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 14, color: "var(--faint)" }}>no one placed yet</span>
        )}
      </div>

      <div className="row" style={{ gap: 10 }}>
        <button className="btn warm sm" style={{ flex: 1, justifyContent: "center" }} onClick={onInvite}>
          <Icon name="mail" size={14} c="#fff" /> Add {personName}
        </button>
        <button className="btn ghost sm" style={{ flex: 1, justifyContent: "center" }} onClick={onDetails} title="See who's inside">
          <Icon name="eye" size={15} c="var(--muted)" /> Group details
        </button>
      </div>
    </div>
  );
}

// A group as an invite target (used in the arrival full page's right rail): name + badge,
// schedule, a clamped blurb, an Invite button and an eye that opens the full details.
export function GroupInviteCard({
  c,
  personName,
  onInvite,
  onDetails,
}: {
  c: GroupCard;
  personName: string;
  onInvite: () => void;
  onDetails: () => void;
}) {
  const count = c.members.length;
  return (
    <div className="sk thin soft" style={{ padding: "15px 16px", display: "flex", flexDirection: "column", gap: 11 }}>
      <div className="row" style={{ gap: 9, alignItems: "flex-start" }}>
        <div className="stack" style={{ gap: 3, flex: 1, minWidth: 0 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <span className="h-title" style={{ fontSize: 19, color: "var(--ink)" }}>
              {c.name}
            </span>
            <CircleBadge c={c} size={11} />
          </div>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {c.when}
            {c.durationMinutes != null ? ` · ${c.durationMinutes} min` : ""} · {count} {count === 1 ? "person" : "people"}
          </span>
        </div>
        <button className="btn ghost icon sm" title="See who’s inside" onClick={onDetails}>
          <Icon name="eye" size={16} c="var(--muted)" />
        </button>
      </div>
      {c.description && (
        <p
          style={{
            fontSize: 13.5,
            color: "var(--muted)",
            lineHeight: 1.45,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {c.description}
        </p>
      )}
      <button className="btn warm sm" style={{ justifyContent: "center" }} onClick={onInvite}>
        <Icon name="mail" size={14} c="#fff" /> Add {personName}
      </button>
    </div>
  );
}

// ----------------------------------------------------------------- place-in-a-group popup
export function PlacePopup({
  person,
  groups,
  onPlace,
  onClose,
}: {
  person: Person;
  groups: GroupCard[];
  onPlace: (groupId: number) => void;
  onClose: () => void;
}) {
  const m = person;
  return (
    <div
      className="sk"
      style={{
        width: 460,
        maxWidth: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <div className="row" style={{ padding: "18px 22px 14px", gap: 13 }}>
        <Avatar name={m.name} size={42} tone={m.tone} />
        <div className="stack" style={{ gap: 2, flex: 1 }}>
          <span className="h-title" style={{ fontSize: 23, color: "var(--ink)" }}>
            Place {m.name} in a group
          </span>
          {(m.lostCat || m.recency) && (
            <span style={{ fontSize: 14.5, color: "var(--muted)" }}>
              {lostLabel(m)}
              {m.lostCat && m.recency ? " · " : ""}
              {sinceShort(m.recency)}
            </span>
          )}
        </div>
        <CloseBtn onClick={onClose} />
      </div>
      <DashRule />
      <div className="scroll" style={{ padding: "16px 22px" }}>
        <SoftLabel style={{ marginBottom: 11 }}>Your groups · pick where they’d feel at home</SoftLabel>
        <div className="stack" style={{ gap: 10 }}>
          {groups.length === 0 && (
            <div className="sk thin soft" style={{ padding: "18px 16px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}>
              You don’t have any groups yet - create one first.
            </div>
          )}
          {groups.map((c) => (
            <div key={c.groupId} className="sk thin soft" style={{ padding: "13px 15px", display: "flex", alignItems: "center", gap: 12 }}>
              <div className="stack" style={{ gap: 2, flex: 1, minWidth: 0 }}>
                <span className="h-title" style={{ fontSize: 19, color: "var(--ink)" }}>
                  {c.name}
                </span>
                <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{c.when}</span>
              </div>
              <button className="btn warm sm" onClick={() => onPlace(c.groupId)}>
                <Icon name="mail" size={14} c="#fff" /> Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- message thread popup
export function MessagePopup({
  person,
  onClose,
  onSend,
}: {
  person: Person;
  onClose: () => void;
  onSend?: (body: string) => void;
}) {
  const m = person;
  const [draft, setDraft] = useState("");
  const submit = () => {
    const body = draft.trim();
    if (body && onSend) {
      onSend(body);
      setDraft("");
    }
  };
  return (
    <div
      className="sk"
      style={{
        width: 430,
        maxWidth: "100%",
        height: 540,
        maxHeight: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <div className="row" style={{ padding: "16px 20px 12px", gap: 12 }}>
        <Avatar name={m.name} size={40} tone={m.tone} />
        <div className="stack" style={{ gap: 1, flex: 1 }}>
          <span className="h-title" style={{ fontSize: 22, color: "var(--ink)" }}>
            {m.name}
          </span>
          <span className="row" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>
            <Icon name="lock" size={13} c="var(--calm)" /> private · only you two
          </span>
        </div>
        <CloseBtn onClick={onClose} />
      </div>
      <DashRule />
      <div className="scroll" style={{ flex: 1, padding: "16px 18px" }}>
        {m.dm.length === 0 && (
          <div
            className="sk thin soft"
            style={{ padding: "20px 16px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}
          >
            No messages yet - you could say hello.
          </div>
        )}
        <div className="stack" style={{ gap: 12 }}>
          {m.dm.map((b, i) =>
            b.from === "you" ? (
              <div key={i} className="row" style={{ justifyContent: "flex-end" }}>
                <div className="stack" style={{ gap: 4, alignItems: "flex-end", maxWidth: "82%" }}>
                  <div
                    className="sk thin"
                    style={{ background: "var(--warm)", borderColor: "transparent", color: "#fff", padding: "9px 13px", fontSize: 15.5, lineHeight: 1.4 }}
                  >
                    {b.t}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--faint)" }}>You · {b.at}</span>
                </div>
              </div>
            ) : (
              <div key={i} className="row" style={{ gap: 9, alignItems: "flex-end" }}>
                <Avatar name={m.name} size={26} tone={m.tone} />
                <div className="stack" style={{ gap: 4, maxWidth: "82%" }}>
                  <div className="sk thin soft" style={{ padding: "9px 13px", fontSize: 15.5, lineHeight: 1.4, color: "var(--ink)" }}>
                    {b.t}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--faint)" }}>
                    {m.name} · {b.at}
                  </span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <DashRule />
      <div className="row" style={{ padding: "12px 16px", gap: 10 }}>
        {onSend ? (
          <input
            className="field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={`Reply to ${m.name}…`}
          />
        ) : (
          <div className="well row" style={{ flex: 1, padding: "10px 14px", color: "var(--faint)", fontSize: 15.5 }}>
            Reply to {m.name}…
          </div>
        )}
        <button className="btn warm icon" onClick={submit} disabled={onSend ? !draft.trim() : undefined}>
          <Icon name="send" size={17} c="#fff" />
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------- reflections popup
export function ReflectionsPopup({ person, onClose }: { person: Person; onClose: () => void }) {
  const m = person;
  return (
    <div
      className="sk"
      style={{
        width: 440,
        maxWidth: "100%",
        maxHeight: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <div className="row" style={{ padding: "16px 20px 12px", gap: 12 }}>
        <Avatar name={m.name} size={40} tone={m.tone} />
        <div className="stack" style={{ gap: 1, flex: 1 }}>
          <span className="h-title" style={{ fontSize: 22, color: "var(--ink)" }}>
            {m.name}’s reflections
          </span>
          <span style={{ fontSize: 13, color: "var(--sky-ink)" }}>shared with you alone</span>
        </div>
        <CloseBtn onClick={onClose} />
      </div>
      <DashRule />
      <div className="scroll" style={{ padding: "16px 20px" }}>
        <div className="row" style={{ gap: 9, marginBottom: 14, color: "var(--sky-ink)", fontSize: 14, lineHeight: 1.4 }}>
          <Icon name="note" size={15} c="var(--sky)" style={{ marginTop: 1 }} />
          <span>{m.name} chose to share these with you.</span>
        </div>
        <div className="stack" style={{ gap: 12 }}>
          {m.reflections.length === 0 && (
            <div
              className="sk thin soft"
              style={{ padding: "20px 16px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}
            >
              Nothing shared yet.
            </div>
          )}
          {m.reflections.map((r, i) => (
            <div key={i} className="sk v2 thin" style={{ padding: "14px 16px", borderColor: "var(--sky)" }}>
              <span style={{ fontSize: 14.5, color: "var(--sky-ink)" }}>{r.q}</span>
              <p style={{ fontSize: 16.5, color: "var(--ink)", lineHeight: 1.5, margin: "8px 0 9px" }}>{r.a}</p>
              {r.at && <span style={{ fontSize: 12.5, color: "var(--faint)" }}>{r.at}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
