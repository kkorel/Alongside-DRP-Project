"use client";

// fac view — everyone in one group, all in one place (mirrors the new-arrivals queue).
// Open anyone's full profile to refresh your memory before a session. Member detail isn't
// on the group payload, so each member is loaded via the participant endpoint.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { withFid } from "../../lib/identity";
import { Avatar, DashRule, Icon, Logo, SoftLabel } from "./Primitives";
import { CircleBadge, FullProfilePopup, LostChip, Overlay } from "./Overlays";
import { groupCardFrom, HOBBY_ICON, personFromParticipant, type GroupCard, type Person } from "../lib/data";
import { apiBase, fetchGroups, fetchParticipant, fetchSessionState } from "../lib/api";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="row" style={{ minHeight: "60vh", justifyContent: "center", color: "var(--muted)", fontSize: 16 }}>
      {children}
    </div>
  );
}

function MemberRow({ m, onOpen }: { m: Person; onOpen: () => void }) {
  return (
    <div
      className="sk thin soft"
      style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "232px 1fr 1fr 150px", alignItems: "center", gap: 18 }}
    >
      <div className="row" style={{ gap: 13 }}>
        <Avatar name={m.name} size={44} tone={m.tone} onClick={onOpen} title={`Open ${m.name}'s profile`} />
        <div className="stack" style={{ gap: 2 }}>
          <span className="h-title" style={{ fontSize: 20, color: "var(--ink)", cursor: "pointer" }} onClick={onOpen}>
            {m.name}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--muted)" }}>
            {[m.pronouns, m.age].filter(Boolean).join(" · ") || "—"}
          </span>
        </div>
      </div>
      <div className="stack" style={{ gap: 7, minWidth: 0 }}>
        <SoftLabel c="var(--warm-ink)">Who they lost</SoftLabel>
        <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
          <LostChip m={m} size={13} />
          {m.recency && (
            <span className="chip" style={{ fontSize: 12.5 }}>
              <Icon name="clock" size={12} c="var(--muted)" /> {m.recency.toLowerCase()}
            </span>
          )}
        </div>
      </div>
      <div className="stack" style={{ gap: 7, minWidth: 0 }}>
        <SoftLabel>A little about them</SoftLabel>
        <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
          {m.hobbies.slice(0, 2).map((t, k) => (
            <span key={k} className="chip calm" style={{ fontSize: 12.5 }}>
              {HOBBY_ICON[t] && <Icon name={HOBBY_ICON[t]} size={12} c="var(--calm-ink)" />} {t}
            </span>
          ))}
          {m.culture && m.culture !== "—" && (
            <span className="chip" style={{ fontSize: 12.5 }}>
              <Icon name="people" size={12} c="var(--muted)" /> {m.culture}
            </span>
          )}
        </div>
      </div>
      <button className="btn sm" style={{ justifySelf: "end" }} onClick={onOpen}>
        <Icon name="eye" size={15} c="var(--ink)" /> Full profile
      </button>
    </div>
  );
}

export function GroupRoster({ groupId }: { groupId: number }) {
  const router = useRouter();
  const apiUrl = apiBase();
  const [group, setGroup] = useState<GroupCard | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [who, setWho] = useState<Person | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const gs = await fetchGroups(apiUrl);
        const found = gs.find((g) => g.groupId === groupId);
        if (!found) {
          if (active) setStatus("error");
          return;
        }
        const session = await fetchSessionState(apiUrl, groupId).catch(() => null);
        const card = groupCardFrom(found, session?.sessionClosedForWeek ?? false);
        const ps = await Promise.all(card.members.map((mm) => fetchParticipant(apiUrl, mm.id)));
        if (!active) return;
        setGroup(card);
        setPeople(ps.map(personFromParticipant));
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [apiUrl, groupId]);

  if (status === "loading") return <Centered>Loading…</Centered>;
  if (status === "error" || !group) return <Centered>We couldn’t find that group.</Centered>;

  return (
    <div className="stack" style={{ minHeight: "100%", background: "var(--paper)", position: "relative" }}>
      <div className="row" style={{ padding: "15px 26px", gap: 14 }}>
        <button className="btn ghost sm" onClick={() => router.push(withFid("/facilitator"))}>
          <Icon name="back" size={16} c="var(--muted)" /> Your groups
        </button>
        <div style={{ flex: 1 }} />
        <Logo size={26} />
      </div>
      <DashRule />
      <div className="scroll" style={{ flex: 1, padding: "26px 30px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div className="row" style={{ gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
            <h2 className="h-title uline" style={{ fontSize: 30, color: "var(--ink)" }}>
              {group.name}
            </h2>
            <CircleBadge c={group} />
            <span className="chip" style={{ marginLeft: 4 }}>
              <Icon name="people" size={14} c="var(--muted)" /> {group.members.length} here
            </span>
          </div>
          <p style={{ fontSize: 15.5, color: "var(--muted)", margin: "12px 0 20px", maxWidth: 600, lineHeight: 1.5 }}>
            Everyone in {group.name}, all in one place. Open anyone’s full profile to refresh your memory before a session.
          </p>
          {people.length === 0 ? (
            <div
              className="sk thin soft"
              style={{ padding: "26px", textAlign: "center", color: "var(--muted)", fontSize: 16, borderStyle: "dashed" }}
            >
              No one is in this group yet.
            </div>
          ) : (
            <div className="stack" style={{ gap: 12 }}>
              {people.map((m) => (
                <MemberRow key={m.id} m={m} onOpen={() => setWho(m)} />
              ))}
            </div>
          )}
        </div>
      </div>
      {who && (
        <Overlay onClose={() => setWho(null)}>
          <FullProfilePopup person={who} group={group.name} onClose={() => setWho(null)} />
        </Overlay>
      )}
    </div>
  );
}
