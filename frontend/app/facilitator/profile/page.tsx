"use client";

// The docked profile hub, shown on its own so the panel can be reviewed. It reads a real
// member of the live group (the first placed person) with their private thread and shared
// reflections. In the room this panel docks beside the conversation.

import { useEffect, useState } from "react";
import { Hub } from "../components/Hub";
import {
  apiBase,
  facilitatorId,
  fetchGroups,
  fetchInbox,
  fetchParticipant,
  fetchPrivateThread,
  liveGroupId,
} from "../lib/api";
import { dmsFrom, personFromParticipant, sharedReflections, type Person } from "../lib/data";

export default function FacilitatorProfilePage() {
  const apiUrl = apiBase();
  const [person, setPerson] = useState<Person | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");

  useEffect(() => {
    (async () => {
      try {
        const groups = await fetchGroups(apiUrl);
        const live = groups.find((g) => g.groupId === liveGroupId) ?? groups[0];
        const member = live?.members.find((m) => m.role.toLowerCase() !== "facilitator");
        if (!live || !member) {
          setStatus("empty");
          return;
        }
        const [p, thread, inbox] = await Promise.all([
          fetchParticipant(apiUrl, member.id),
          fetchPrivateThread(apiUrl, live.groupId, member.id),
          fetchInbox(apiUrl, live.groupId),
        ]);
        const entry = inbox.find((e) => e.participant.id === member.id);
        setPerson({
          ...personFromParticipant(p),
          dm: dmsFrom(thread, facilitatorId),
          reflections: entry ? sharedReflections(entry.sharedPrivateNote, entry.sharedFacilitatorNote, entry.sharedFreeWriting, entry.lastReflectionShareAt) : [],
          unread: entry?.hasUnread ? 1 : 0,
        });
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    })();
  }, [apiUrl]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--paper)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
        position: "relative",
      }}
    >
      <span className="scrawl" style={{ position: "absolute", top: 22, left: 26, fontSize: 21, color: "var(--faint)" }}>
        ↑ docks beside the conversation
      </span>
      <div
        className="sk"
        style={{
          width: 460,
          maxWidth: "100%",
          height: 760,
          maxHeight: "calc(100vh - 60px)",
          background: "var(--paper)",
          overflow: "hidden",
          boxShadow: "0 18px 50px rgba(58,45,30,.18)",
          display: "flex",
        }}
      >
        <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
          {status === "ready" && person ? (
            <Hub person={person} tab="about" />
          ) : (
            <div className="row" style={{ flex: 1, justifyContent: "center", color: "var(--muted)", fontSize: 15.5 }}>
              {status === "loading" && "Loading…"}
              {status === "empty" && "No one is placed in a group yet."}
              {status === "error" && "We couldn’t reach the server."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
