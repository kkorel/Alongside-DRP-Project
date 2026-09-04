"use client";

// fac view — invite people into a group. A gentle ask, here applied directly (places the
// person into the group). Opened as a slide-over from a group's ⋯ menu.

import { useEffect, useState } from "react";
import { Avatar, DashRule, Icon, SoftLabel } from "./Primitives";
import { CloseBtn, Overlay } from "./Overlays";
import { Hub } from "./Hub";
import {
  lostLabel,
  personFromParticipant,
  sinceShort,
  type GroupCard,
  type Person,
} from "../lib/data";
import { apiBase, fetchArrivals, placeParticipant } from "../lib/api";

function Candidate({
  m,
  invited,
  onProfile,
  onInvite,
}: {
  m: Person;
  invited: boolean;
  onProfile: () => void;
  onInvite: () => void;
}) {
  return (
    <div
      className="sk thin"
      style={{
        padding: "13px 16px",
        display: "flex",
        alignItems: "center",
        gap: 13,
        borderColor: invited ? "var(--calm)" : "var(--line)",
      }}
    >
      <Avatar name={m.name} size={40} tone={m.tone} onClick={onProfile} title={`Open ${m.name}'s profile`} />
      <div className="stack" style={{ gap: 3, flex: 1, minWidth: 0 }}>
        <span className="h-title" style={{ fontSize: 19, color: "var(--ink)", cursor: "pointer" }} onClick={onProfile}>
          {m.name}
        </span>
        <span style={{ fontSize: 13.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {lostLabel(m) || "—"}
          {m.recency ? ` · ${sinceShort(m.recency)}` : ""}
        </span>
      </div>
      {invited ? (
        <span className="chip calm">
          <Icon name="check" size={13} c="var(--calm-ink)" /> added
        </span>
      ) : (
        <button className="btn warm sm" onClick={onInvite}>
          <Icon name="plus" size={14} c="#fff" /> Add
        </button>
      )}
    </div>
  );
}

type InviteModal = { type: "card"; person: Person } | null;

export function InvitePanel({
  group,
  onClose,
  onPlaced,
}: {
  group: GroupCard;
  onClose: () => void;
  onPlaced: () => void;
}) {
  const apiUrl = apiBase();
  const [candidates, setCandidates] = useState<Person[]>([]);
  const [invited, setInvited] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [modal, setModal] = useState<InviteModal>(null);

  useEffect(() => {
    fetchArrivals(apiUrl)
      .then((ar) => {
        setCandidates(ar.map(personFromParticipant));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [apiUrl]);

  const invite = async (person: Person) => {
    try {
      await placeParticipant(apiUrl, group.groupId, person.id);
      setInvited((prev) => new Set(prev).add(person.id));
      onPlaced();
    } catch {
      /* surfaced softly — the row simply stays un-invited */
    }
  };

  return (
    <div
      className="sk"
      style={{
        width: 460,
        maxWidth: "100%",
        height: 760,
        maxHeight: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <div className="row" style={{ padding: "17px 22px", gap: 12 }}>
        <div className="av" style={{ width: 40, height: 40, background: "var(--warm-soft)", borderColor: "var(--warm)" }}>
          <Icon name="mail" size={20} c="var(--warm)" />
        </div>
        <div className="stack" style={{ gap: 2, flex: 1 }}>
          <span className="h-title" style={{ fontSize: 21, color: "var(--ink)" }}>
            Add to {group.name}
          </span>
          <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{group.when}</span>
        </div>
        <CloseBtn onClick={onClose} />
      </div>
      <DashRule />
      <div className="scroll" style={{ flex: 1, padding: "18px 20px" }}>
        <SoftLabel style={{ marginBottom: 11 }}>People waiting to be placed</SoftLabel>
        {status === "loading" && <span style={{ fontSize: 15, color: "var(--muted)" }}>Loading…</span>}
        {status === "error" && <span style={{ fontSize: 15, color: "var(--muted)" }}>Couldn’t load people just now.</span>}
        {status === "ready" && candidates.length === 0 && (
          <span style={{ fontSize: 15, color: "var(--faint)" }}>No one is waiting to be placed right now.</span>
        )}
        <div className="stack" style={{ gap: 9 }}>
          {candidates.map((m) => (
            <Candidate
              key={m.id}
              m={m}
              invited={invited.has(m.id)}
              onProfile={() => setModal({ type: "card", person: m })}
              onInvite={() => invite(m)}
            />
          ))}
        </div>

        <div
          className="sk dash soft"
          style={{ marginTop: 18, padding: "13px 15px", display: "flex", gap: 10, alignItems: "flex-start", background: "transparent" }}
        >
          <Icon name="heart" size={16} c="var(--calm)" style={{ marginTop: 2 }} />
        </div>
      </div>

      {modal && (
        <Overlay onClose={() => setModal(null)}>
          {modal.type === "card" && <Hub variant="card" person={modal.person} onClose={() => setModal(null)} />}
        </Overlay>
      )}
    </div>
  );
}
