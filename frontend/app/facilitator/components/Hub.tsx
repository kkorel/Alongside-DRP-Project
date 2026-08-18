"use client";

// fac view — the member profile as a 3-tab panel (About / Messages / Reflections).
// Two presentations from the same component:
//   variant="card"   — a pop-up card (the profile you get when you click a face)
//   variant="docked" — the in-place slide-over (used on /facilitator/profile)
// The header mirrors the summary pop-up.

import { Fragment, useState } from "react";
import { dayLabelFor, isNewDay } from "../../lib/format";
import { Avatar, DashRule, Field, Icon, IconName, SoftLabel } from "./Primitives";
import { CloseBtn, HobbyChips, LostCategory, PopBlock, PrivacyNote } from "./Overlays";
import type { Person } from "../lib/data";

export type HubTab = "about" | "message" | "reflections";

function HubTabButton({
  id,
  icon,
  label,
  accent,
  tab,
  setTab,
}: {
  id: HubTab;
  icon: IconName;
  label: string;
  accent: string;
  tab: HubTab;
  setTab: (t: HubTab) => void;
}) {
  const on = tab === id;
  return (
    <div
      className="row fac-tap"
      onClick={() => setTab(id)}
      style={{
        flex: 1,
        justifyContent: "center",
        gap: 8,
        padding: "11px 0",
        borderBottom: on ? `2.5px solid ${accent}` : "2.5px dashed var(--line)",
        color: on ? "var(--ink)" : "var(--muted)",
        fontSize: 16,
      }}
    >
      <Icon name={icon} size={17} c={on ? accent : "var(--muted)"} /> {label}
    </div>
  );
}

function HubTabs({ tab, setTab }: { tab: HubTab; setTab: (t: HubTab) => void }) {
  return (
    <div className="row">
      <HubTabButton id="about" icon="person" label="About" accent="var(--calm)" tab={tab} setTab={setTab} />
      <HubTabButton id="message" icon="bubbleLines" label="Message" accent="var(--warm)" tab={tab} setTab={setTab} />
      <HubTabButton id="reflections" icon="note" label="Reflections" accent="var(--sky)" tab={tab} setTab={setTab} />
    </div>
  );
}

function ProfileHeader({ m, onClose, backLabel, backChev }: { m: Person; onClose?: () => void; backLabel?: string; backChev?: boolean }) {
  return (
    <div className="row" style={{ padding: "18px 20px 14px", gap: 14, alignItems: "flex-start" }}>
      <Avatar name={m.name} size={56} tone={m.tone} />
      <div className="stack" style={{ gap: 4, flex: 1, paddingTop: 2 }}>
        <h3 className="h-title" style={{ fontSize: 27, color: "var(--ink)" }}>
          {m.name}
        </h3>
        <div className="row" style={{ gap: 8, color: "var(--muted)", fontSize: 14.5, flexWrap: "wrap" }}>
          {m.pronouns && <span>{m.pronouns}</span>}
          {m.pronouns && m.age && <span style={{ color: "var(--faint)" }}>·</span>}
          {m.age && <span>{m.age}</span>}
        </div>
      </div>
      {onClose && (
        backLabel
          ? (
            <button className="btn ghost sm" onClick={onClose} style={{ gap: 6 }}>
              {backChev
                ? <Icon name="chev" size={15} c="var(--muted)" style={{ transform: "rotate(180deg)" }} />
                : <Icon name="back" size={15} c="var(--muted)" />} {backLabel}
            </button>
          )
          : <CloseBtn onClick={onClose} />
      )}
    </div>
  );
}

function ProfileAbout({ m }: { m: Person }) {
  return (
    <div className="scroll" style={{ flex: 1, padding: "18px 20px" }}>
      <div className="stack" style={{ gap: 14 }}>
        {m.fact && (
          <PopBlock icon="spark" label="A fact about them" accent="var(--warm-ink)" skin="v3" tint="var(--warm-soft)">
            {m.fact}
          </PopBlock>
        )}
        <div className="stack" style={{ gap: 9 }}>
          <SoftLabel>Hobbies</SoftLabel>
          <HobbyChips items={m.hobbies} />
        </div>
        <Field label="Cultural background">{m.culture && m.culture !== "—" ? m.culture : "they’d rather not say"}</Field>
        <DashRule />
        <div className="stack" style={{ gap: 9 }}>
          <SoftLabel c="var(--warm-ink)">What they’re carrying</SoftLabel>
          <LostCategory m={m} />
        </div>
      </div>
    </div>
  );
}

// A small centred day marker ("Today", "Yesterday", "6 June") shown once per
// day, so threads that span weeks stay easy to follow.
function DaySeparator({ iso }: { iso: string }) {
  const label = dayLabelFor(iso);
  if (!label) return null;
  return (
    <div className="row" style={{ justifyContent: "center" }} aria-hidden="true">
      <span className="chip" style={{ fontSize: 12, padding: "2px 12px", color: "var(--faint)" }}>
        {label}
      </span>
    </div>
  );
}

function DMThread({ m, onSend }: { m: Person; onSend?: (body: string) => void }) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const body = draft.trim();
    if (body && onSend) {
      onSend(body);
      setDraft("");
    }
  };
  return (
    <div className="stack" style={{ flex: 1, minHeight: 0 }}>
      <div className="scroll" style={{ flex: 1, padding: "18px 20px" }}>
        <PrivacyNote>private · only you two</PrivacyNote>
        <div className="stack" style={{ gap: 13 }}>
          {m.dm.length === 0 && (
            <div className="sk thin soft dash" style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: 15.5 }}>
              No messages yet - you could say hello.
            </div>
          )}
          {m.dm.map((b, i) => (
            <Fragment key={i}>
            {isNewDay(m.dm[i - 1]?.atIso, b.atIso) && <DaySeparator iso={b.atIso} />}
            {b.from === "you" ? (
              <div className="row" style={{ justifyContent: "flex-end" }}>
                <div className="stack" style={{ gap: 4, alignItems: "flex-end", maxWidth: "82%" }}>
                  <div
                    className="sk thin"
                    style={{ background: "var(--warm)", borderColor: "transparent", color: "#fff", padding: "10px 14px", fontSize: 15.5, lineHeight: 1.4 }}
                  >
                    {b.t}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--faint)" }}>You · {b.at}</span>
                </div>
              </div>
            ) : (
              <div className="row" style={{ gap: 9, alignItems: "flex-end" }}>
                <Avatar name={m.name} size={28} tone={m.tone} />
                <div className="stack" style={{ gap: 4, maxWidth: "82%" }}>
                  <div className="sk thin soft" style={{ padding: "10px 14px", fontSize: 15.5, lineHeight: 1.4, color: "var(--ink)" }}>
                    {b.t}
                  </div>
                  <span style={{ fontSize: 11.5, color: "var(--faint)" }}>
                    {m.name} · {b.at}
                  </span>
                </div>
              </div>
            )}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="row" style={{ padding: "12px 16px", gap: 10, borderTop: "2px dashed var(--line)" }}>
        {onSend ? (
          <input
            className="field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={`Reply gently to ${m.name}…`}
          />
        ) : (
          <div className="well row" style={{ flex: 1, padding: "10px 14px", color: "var(--faint)", fontSize: 15.5 }}>
            Reply gently to {m.name}…
          </div>
        )}
        <button className="btn warm icon" onClick={submit} disabled={onSend ? !draft.trim() : undefined}>
          <Icon name="send" size={17} c="#fff" />
        </button>
      </div>
    </div>
  );
}

function ReflectionList({ m }: { m: Person }) {
  return (
    <div className="scroll" style={{ flex: 1, padding: "18px 20px" }}>
      <PrivacyNote icon="note">private · only you two</PrivacyNote>
      <div className="stack" style={{ gap: 13 }}>
        {m.reflections.length === 0 && (
          <div className="sk thin soft dash" style={{ padding: "22px 16px", textAlign: "center", color: "var(--muted)", fontSize: 15.5 }}>
            Nothing shared yet.
          </div>
        )}
        {m.reflections.map((r, i) => (
          <Fragment key={i}>
          {r.atIso && isNewDay(m.reflections[i - 1]?.atIso ?? undefined, r.atIso) && (
            <DaySeparator iso={r.atIso} />
          )}
          <div className="sk v2 thin" style={{ padding: "15px 17px", borderColor: "var(--sky)" }}>
            <span style={{ fontSize: 14.5, color: "var(--sky-ink)" }}>{r.q}</span>
            <p style={{ fontSize: 16, color: "var(--ink)", lineHeight: 1.5, margin: "9px 0 10px" }}>{r.a}</p>
            {r.at && <span style={{ fontSize: 12.5, color: "var(--faint)" }}>{r.at}</span>}
          </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function Hub({
  person,
  tab: initial = "about",
  variant = "docked",
  onClose,
  onSend,
  backLabel,
  backChev,
}: {
  person: Person;
  tab?: HubTab;
  variant?: "docked" | "card";
  onClose?: () => void;
  onSend?: (body: string) => void;
  backLabel?: string;
  backChev?: boolean;
}) {
  const [tab, setTab] = useState<HubTab>(initial);
  const body = (
    <>
      <ProfileHeader m={person} onClose={onClose} backLabel={backLabel} backChev={backChev} />
      <HubTabs tab={tab} setTab={setTab} />
      {tab === "about" && <ProfileAbout m={person} />}
      {tab === "message" && <DMThread m={person} onSend={onSend} />}
      {tab === "reflections" && <ReflectionList m={person} />}
    </>
  );

  if (variant === "card") {
    return (
      <div
        className="sk"
        style={{
          width: 452,
          maxWidth: "100%",
          height: 560,
          maxHeight: "100%",
          background: "var(--paper)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 18px 50px rgba(58,45,30,.20)",
          overflow: "hidden",
        }}
      >
        {body}
      </div>
    );
  }

  return (
    <div className="stack" style={{ height: "100%", background: "var(--paper)" }}>
      {body}
    </div>
  );
}
