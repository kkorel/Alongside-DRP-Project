"use client";

// fac view — what the facilitator sees of a new arrival's onboarding.
//   OnboardingList — the scannable queue of people waiting to be placed.
//   OnboardingCard — one arrival read in full: who they are (left) + the groups you can
//                    bring them into (right).
// Wired to the backend; inviting a person into a group persists.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { withFid } from "../../lib/identity";
import { Avatar, DashRule, Field, Icon, SoftLabel } from "./Primitives";
import {
  ConfirmPopup,
  FullProfilePopup,
  GroupPlaceCard,
  HobbyChips,
  LostCategory,
  LostChip,
  Overlay,
  PopBlock,
} from "./Overlays";
import { GroupDetailPopup } from "./GroupDetail";
import { groupCardFrom, HOBBY_ICON, personFromParticipant, type GroupCard, type Person } from "../lib/data";
import { apiBase, fetchArrivals, fetchGroups, fetchParticipant, placeParticipant } from "../lib/api";
import { POLL_INTERVAL_MS } from "../../lib/pollIntervals";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="row" style={{ minHeight: "60vh", justifyContent: "center", color: "var(--muted)", fontSize: 16 }}>
      {children}
    </div>
  );
}

// ============================================================ the waiting queue row
// One scannable row per person, used on the dashboard and the arrivals list. The name,
// avatar and Place all open the full arrival page.
export function ArrivalRow({ m, onPlace }: { m: Person; onPlace: () => void }) {
  return (
    <div
      className="sk thin soft"
      style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "232px 1fr 1fr 124px", alignItems: "center", gap: 18 }}
    >
      <div className="row" style={{ gap: 13 }}>
        <Avatar name={m.name} size={44} tone={m.tone} onClick={onPlace} title={`Open ${m.name}'s arrival`} />
        <div className="stack" style={{ gap: 2, flex: 1, minWidth: 0 }}>
          <span className="h-title" style={{ fontSize: 20, color: "var(--ink)", cursor: "pointer" }} onClick={onPlace}>
            {m.name}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--muted)" }}>
            {[m.pronouns, m.age].filter(Boolean).join(" · ") || "—"}
          </span>
          {m.finished && (
            <span style={{ fontSize: 12.5, color: "var(--calm-ink)", whiteSpace: "nowrap", overflow: "hidden" }}>{m.finished}</span>
          )}
        </div>
      </div>

      {/* what they're carrying — who they lost, then how recently */}
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

      {/* a little about them — hobbies + background */}
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

      <button className="btn warm sm" style={{ justifySelf: "end" }} onClick={onPlace}>
        <Icon name="mail" size={15} c="#fff" /> Place
      </button>
    </div>
  );
}

// ============================================================ the arrival, read in full
type ArrivalDetailModal =
  | { type: "group"; group: GroupCard }
  | { type: "full"; person: Person; group: string }
  | { type: "sent"; group: GroupCard }
  | null;

export function OnboardingCard({ participantId, from }: { participantId: number; from?: string }) {
  const router = useRouter();
  const apiUrl = apiBase();
  // Reached from the dashboard's "waiting to be placed" list or from the full arrivals
  // page — either way, send the facilitator back where they came from.
  const cameFromDashboard = from === "dashboard";
  const backTo = cameFromDashboard ? "/facilitator" : "/facilitator/arrivals";
  const backLabel = cameFromDashboard ? "Back to home" : "Back to arrivals";
  // Starting a new group from here should return to this person's page (so they can be
  // placed into the group just made), not the facilitator home.
  const selfPath = `/facilitator/arrivals/${participantId}${cameFromDashboard ? "?from=dashboard" : ""}`;
  const [person, setPerson] = useState<Person | null>(null);
  const [groups, setGroups] = useState<GroupCard[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [modal, setModal] = useState<ArrivalDetailModal>(null);
  const [panelWidth, setPanelWidth] = useState(460);
  const [splitterHover, setSplitterHover] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const close = () => setModal(null);

  const onSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: panelWidth };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - ev.clientX;
      setPanelWidth(Math.max(320, Math.min(560, dragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  useEffect(() => {
    Promise.all([fetchParticipant(apiUrl, participantId), fetchGroups(apiUrl)])
      .then(([p, gs]) => {
        setPerson(personFromParticipant(p));
        setGroups(gs.map((g) => groupCardFrom(g)));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [apiUrl, participantId]);

  const invite = async (group: GroupCard) => {
    if (!person) return;
    try {
      await placeParticipant(apiUrl, group.groupId, person.id);
      setModal({ type: "sent", group });
    } catch {
      /* leave the rail as-is; the facilitator can try again */
    }
  };

  // Tapping a member's face on a group card opens that member's full profile.
  const openMember = async (id: number, groupName: string) => {
    try {
      const p = await fetchParticipant(apiUrl, id);
      setModal({ type: "full", person: personFromParticipant(p), group: groupName });
    } catch {
      /* ignore a transient profile fetch */
    }
  };

  if (status === "loading") return <Centered>Loading…</Centered>;
  if (status === "error" || !person) return <Centered>We couldn’t find that person.</Centered>;
  const m = person;

  return (
    <div className="stack" style={{ minHeight: "100%", height: "100%", background: "var(--paper)", position: "relative" }}>
      <div className="row" style={{ flex: 1, minHeight: 0, alignItems: "stretch" }}>
        {/* ---------------- LEFT · who they are ---------------- */}
        <div className="scroll" style={{ flex: 1, padding: "26px 32px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {/* Slim, calm back link — returns to wherever they came from (?from). */}
            <button
              className="btn ghost sm"
              onClick={() => router.push(withFid(backTo))}
              style={{ border: "none", padding: "3px 6px", marginLeft: -6, marginBottom: 16, color: "var(--muted)" }}
            >
              <Icon name="back" size={15} c="var(--muted)" /> {backLabel}
            </button>
            <div className="row" style={{ gap: 18, alignItems: "flex-start" }}>
              <Avatar name={m.name} size={64} tone={m.tone} />
              <div className="stack" style={{ gap: 6, flex: 1, paddingTop: 2 }}>
                <div className="row" style={{ gap: 11, flexWrap: "wrap" }}>
                  <h2 className="h-title" style={{ fontSize: 33, color: "var(--ink)" }}>
                    {m.name}
                  </h2>
                  <span className="chip warm" style={{ fontSize: 13 }}>
                    <Icon name="spark" size={13} c="var(--warm-ink)" /> new arrival
                  </span>
                </div>
                <div className="row" style={{ gap: 9, color: "var(--muted)", fontSize: 15.5, flexWrap: "wrap" }}>
                  {m.pronouns && <span>{m.pronouns}</span>}
                  {m.pronouns && m.age && <span style={{ color: "var(--faint)" }}>·</span>}
                  {m.age && <span>{m.age}</span>}
                  {(m.pronouns || m.age) && m.finished && <span style={{ color: "var(--faint)" }}>·</span>}
                  {m.finished && <span style={{ color: "var(--calm-ink)" }}>{m.finished}</span>}
                </div>
              </div>
            </div>

            {/* the one fact about them */}
            {m.fact && (
              <div style={{ marginTop: 22 }}>
                <PopBlock icon="spark" label="A fact about them" accent="var(--warm-ink)" skin="v3" tint="var(--warm-soft)">
                  {m.fact}
                </PopBlock>
              </div>
            )}

            {/* one combined card — what they're carrying & a little about them */}
            <div className="sk v2" style={{ padding: "22px 24px", marginTop: 18 }}>
              <SoftLabel style={{ marginBottom: 16 }}>What they’re carrying & a little about them</SoftLabel>
              <div className="stack" style={{ gap: 16 }}>
                <div className="stack" style={{ gap: 8 }}>
                  <SoftLabel c="var(--warm-ink)">Who they lost</SoftLabel>
                  <LostCategory m={m} />
                </div>
                <DashRule />
                <div className="stack" style={{ gap: 9 }}>
                  <SoftLabel>Hobbies</SoftLabel>
                  <HobbyChips items={m.hobbies} />
                </div>
                <Field label="Cultural background">
                  {m.culture && m.culture !== "—" ? m.culture : "they’d rather not say"}
                </Field>
              </div>
            </div>

            <div className="row" style={{ marginTop: 20 }}>
              <button className="btn ghost" onClick={() => router.push(withFid(backTo))}>
                <Icon name="clock" size={16} c="var(--muted)" /> Set aside for now
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- splitter ---------------- */}
        <div
          onMouseDown={onSplitterMouseDown}
          onMouseEnter={() => setSplitterHover(true)}
          onMouseLeave={() => setSplitterHover(false)}
          title="Drag to resize"
          style={{
            width: 16,
            flex: "0 0 16px",
            cursor: "col-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            userSelect: "none",
            transition: "background .15s",
          }}
        >
          <div style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            borderLeft: `1.5px solid ${splitterHover ? "var(--warm)" : "var(--line)"}`,
            transition: "border-color .15s",
          }} />
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 3, opacity: splitterHover ? 1 : 0.35, transition: "opacity .15s" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 10, height: 2.5, borderRadius: 2, background: splitterHover ? "var(--warm)" : "var(--faint)", transition: "background .15s" }} />
            ))}
          </div>
        </div>

        {/* ---------------- RIGHT · bring them into a group ---------------- */}
        <div className="stack" style={{ width: panelWidth, flex: "0 0 auto", background: "var(--paper)" }}>
          <div className="stack" style={{ padding: "20px 22px 12px", gap: 4 }}>
            <span className="h-title" style={{ fontSize: 21, color: "var(--ink)" }}>
              Bring {m.name} into a group
            </span>
          </div>
          <div className="scroll" style={{ flex: 1, padding: "8px 18px 18px" }}>
            <div className="stack" style={{ gap: 12 }}>
              {groups.length === 0 ? (
                <div
                  className="sk thin soft"
                  style={{ padding: "18px 16px", textAlign: "center", color: "var(--muted)", fontSize: 15, borderStyle: "dashed" }}
                >
                  You don’t have any groups yet - start one below.
                </div>
              ) : (
                groups.map((c) => (
                  <GroupPlaceCard
                    key={c.groupId}
                    c={c}
                    personName={m.name}
                    onInvite={() => invite(c)}
                    onDetails={() => setModal({ type: "group", group: c })}
                    onAvatar={(id) => openMember(id, c.name)}
                  />
                ))
              )}
              {/* start a new group — mirrors the trailing card on the home panel */}
              <div
                className="sk dash soft"
                onClick={() => router.push(withFid(`/facilitator/groups/new?returnTo=${encodeURIComponent(selfPath)}`))}
                style={{
                  padding: 22,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  minHeight: 150,
                  cursor: "pointer",
                  background: "transparent",
                }}
              >
                <div className="av anon" style={{ width: 44, height: 44 }}>
                  <Icon name="plus" size={22} c="var(--muted)" />
                </div>
                <span style={{ fontSize: 16, color: "var(--muted)" }}>Start a new group</span>
                <span style={{ fontSize: 13.5, color: "var(--faint)", textAlign: "center", maxWidth: 180 }}>
                  for a new day, a new focus, or new users
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <Overlay onClose={close}>
          {modal.type === "group" && (
            <GroupDetailPopup
              group={modal.group}
              personName={m.name}
              onInvite={() => invite(modal.group)}
              onClose={close}
            />
          )}
          {modal.type === "full" && <FullProfilePopup person={modal.person} group={modal.group} onClose={close} />}
          {modal.type === "sent" && (
            <ConfirmPopup
              icon="mail"
              accent="var(--calm)"
              title={`${m.name} added`}
              body={`${m.name} is now part of ${modal.group.name}. They'll see the group next time they open the app.`}
              confirm="Close"
              cancel={null}
              caption="they're in — no further action needed"
              onClose={() => router.push(withFid(backTo))}
              onConfirm={() => router.push(withFid(backTo))}
            />
          )}
        </Overlay>
      )}
    </div>
  );
}

// ============================================================ the waiting queue page
export function OnboardingList() {
  const router = useRouter();
  const apiUrl = apiBase();
  const [arrivals, setArrivals] = useState<Person[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    const load = () =>
      fetchArrivals(apiUrl)
        .then((ar) => {
          if (!active) return;
          // Oldest onboarding first, so whoever has waited longest to be placed
          // sits at the top of the list.
          const oldestFirst = [...ar].sort(
            (a, b) =>
              new Date(a.onboardingTime).getTime() -
              new Date(b.onboardingTime).getTime(),
          );
          setArrivals(oldestFirst.map(personFromParticipant));
          setStatus("ready");
        })
        .catch(() => {
          // Keep the last good list on a dropped poll; only show an error if the
          // very first load failed.
          if (active) setStatus((s) => (s === "loading" ? "error" : s));
        });
    load();
    // Poll so newly-onboarded arrivals (and their refreshed "onboarded … ago" times)
    // appear without the facilitator refreshing the page.
    const intervalId = window.setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [apiUrl]);

  return (
    <div className="stack" style={{ minHeight: "100%", background: "var(--paper)", position: "relative" }}>
      <div className="scroll" style={{ flex: 1, padding: "26px 30px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <div className="row" style={{ gap: 12, alignItems: "baseline", flexWrap: "wrap" }}>
            <h2 className="h-title uline" style={{ fontSize: 30, color: "var(--ink)" }}>
              New arrivals
            </h2>
            {status === "ready" && (
              <span className="chip warm" style={{ marginLeft: 8 }}>
                {arrivals.length} waiting to be placed
              </span>
            )}
          </div>
          <p style={{ fontSize: 15.5, color: "var(--muted)", margin: "12px 0 20px", maxWidth: 580, lineHeight: 1.5 }}>
            Everyone who has finished onboarding and is waiting to be placed. Open anyone to read their full
            profile and bring them into a group.
          </p>

          {status === "loading" && <Centered>Loading…</Centered>}
          {status === "error" && <Centered>We couldn’t reach the server.</Centered>}
          {status === "ready" && arrivals.length === 0 && (
            <div
              className="sk thin soft"
              style={{ padding: "26px", textAlign: "center", color: "var(--muted)", fontSize: 16, borderStyle: "dashed" }}
            >
              No one is waiting to be placed right now.
            </div>
          )}

          {status === "ready" && arrivals.length > 0 && (
            <div className="stack" style={{ gap: 12 }}>
              {arrivals.map((m) => (
                <ArrivalRow key={m.id} m={m} onPlace={() => router.push(withFid(`/facilitator/arrivals/${m.id}`))} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
