"use client";

// fac view — the shared "private feed" primitives: one unified list of private messages
// and shared reflections. Used by the in-session room rail (single group) and the
// standalone Messages tab (merged across every group). Feed items are keyed by
// (groupId, participantId) since messages and reflections are per-group, so a person in
// two groups appears as two distinct items.

import { useState } from "react";
import { formatMessageTime } from "../../lib/format";
import { Avatar, Icon } from "./Primitives";
import { toneFor, type InboxEntryResponse, type Tone } from "../lib/data";
import { facilitatorId } from "../lib/api";

// One unified private item — warm/orange for a message, sky/blue for a reflection. Always
// shows a time when one is known (reflections have no shared-at column, so theirs is blank).
// groupId scopes the item; groupName is the optional label shown when the feed spans groups.
export type FeedItem = {
  id: number; // participant id
  groupId: number;
  groupName?: string;
  kind: "message" | "reflection";
  name: string;
  tone: Tone;
  at: string;
  atIso: string | null;
  q?: string;
  text: string;
};

export function PrivateFeedItem({
  item,
  onOpen,
  showGroup = false,
  selected = false,
}: {
  item: FeedItem;
  onOpen: () => void;
  showGroup?: boolean;
  selected?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isMsg = item.kind === "message";
  const accent = isMsg ? "var(--warm)" : "var(--sky)";
  const accentInk = isMsg ? "var(--warm-ink)" : "var(--sky-ink)";
  const tint = isMsg ? "var(--warm-soft)" : "var(--sky-soft)";
  return (
    <div
      className="sk thin"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "12px 14px 12px 15px",
        display: "flex",
        gap: 11,
        alignItems: "flex-start",
        cursor: "pointer",
        borderColor: accent,
        borderLeftWidth: 5,
        background: selected || hovered ? "var(--paper)" : undefined,
        transition: "background .15s",
      }}
    >
      <Avatar name={item.name} size={36} tone={item.tone} />
      <div className="stack" style={{ gap: 4, flex: 1, minWidth: 0 }}>
        <div className="row" style={{ gap: 7, flexWrap: "wrap" }}>
          <span className="h-title" style={{ fontSize: 17, color: "var(--ink)" }}>
            {item.name}
          </span>
          <span className="chip" style={{ fontSize: 10.5, padding: "1px 8px", borderColor: accent, background: tint, color: accentInk }}>
            <Icon name={isMsg ? "bubble" : "note"} size={11} c={accentInk} /> {isMsg ? "message" : "reflection"}
          </span>
          {showGroup && item.groupName && (
            <span className="chip" style={{ fontSize: 10.5, padding: "1px 8px", color: "var(--muted)" }}>
              <Icon name="people" size={11} c="var(--muted)" /> {item.groupName}
            </span>
          )}
          <div style={{ flex: 1 }} />
          {item.at && <span style={{ fontSize: 11.5, color: "var(--faint)" }}>{item.at}</span>}
        </div>
        {!isMsg && item.q && <span style={{ fontSize: 12.5, color: accentInk, lineHeight: 1.35 }}>{item.q}</span>}
        <span
          style={{
            fontSize: 14,
            color: "var(--muted)",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.text}
        </span>
      </div>
    </div>
  );
}

// Newest first — items without a timestamp sink to the bottom.
function byNewest(a: FeedItem, b: FeedItem): number {
  if (!a.atIso) return b.atIso ? 1 : 0;
  if (!b.atIso) return -1;
  return new Date(b.atIso).getTime() - new Date(a.atIso).getTime();
}

// Merge one group's private messages and shared reflections into one stream, newest
// first — the rail is a triage surface, so whoever wrote most recently floats to the top.
// Each item is stamped with the group it came from.
export function buildPrivateFeed(
  inbox: InboxEntryResponse[],
  groupId: number,
  groupName?: string,
): FeedItem[] {
  const dms = inbox
    .filter((e) => e.lastMessageBody)
    .map((e): FeedItem => ({
      id: e.participant.id,
      groupId,
      groupName,
      kind: "message",
      name: e.participant.displayName,
      tone: toneFor(e.participant.id),
      at: e.lastMessageAt ? formatMessageTime(e.lastMessageAt) : "",
      atIso: e.lastMessageAt,
      text: (e.lastMessageFromId === facilitatorId ? "You: " : "") + (e.lastMessageBody ?? ""),
    }));
  const refs = inbox
    .filter((e) => e.sharedPrivateNote || e.sharedFacilitatorNote || e.sharedFreeWriting)
    .map((e): FeedItem => ({
      id: e.participant.id,
      groupId,
      groupName,
      kind: "reflection",
      name: e.participant.displayName,
      tone: toneFor(e.participant.id),
      at: e.lastReflectionShareAt ? formatMessageTime(e.lastReflectionShareAt) : "",
      atIso: e.lastReflectionShareAt,
      q: e.sharedPrivateNote ? "How are you feeling now?" : e.sharedFacilitatorNote ? "What has made you come here today?" : "From their free writing",
      text: e.sharedPrivateNote ?? e.sharedFacilitatorNote ?? e.sharedFreeWriting ?? "",
    }));
  return [...dms, ...refs].sort(byNewest);
}

// Merge several groups' feeds into one cross-group stream, newest first across all groups.
export function buildGlobalFeed(
  tagged: { groupId: number; groupName: string; entry: InboxEntryResponse }[],
): FeedItem[] {
  const byGroup = new Map<number, { name: string; entries: InboxEntryResponse[] }>();
  for (const t of tagged) {
    const bucket = byGroup.get(t.groupId) ?? { name: t.groupName, entries: [] };
    bucket.entries.push(t.entry);
    byGroup.set(t.groupId, bucket);
  }
  const all: FeedItem[] = [];
  for (const [groupId, { name, entries }] of byGroup) {
    all.push(...buildPrivateFeed(entries, groupId, name));
  }
  return all.sort(byNewest);
}
