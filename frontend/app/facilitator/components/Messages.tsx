"use client";

// fac view — the standalone Messages & Reflections tab. A WhatsApp-style two-pane view:
// on the left, one merged feed of private messages and shared reflections across every
// group the facilitator holds (filterable by group, searchable by name, with a way to
// reach out to someone first); on the right, the tapped conversation as the docked Hub.
//
// Unlike the in-session room rail, this works out of session and spans all groups — so
// every feed item carries its own groupId, and opening / replying always uses that group.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar, Icon } from "./Primitives";
import { Hub, type HubTab } from "./Hub";
import { buildGlobalFeed, PrivateFeedItem } from "./PrivateFeed";
import { POLL_INTERVAL_MS } from "../../lib/pollIntervals";
import {
  dmsFrom,
  isFacilitator,
  personFromParticipant,
  sharedReflections,
  toneFor,
  type FacGroupResponse,
  type FacMemberResponse,
  type InboxEntryResponse,
  type Person,
} from "../lib/data";
import {
  apiBase,
  facilitatorId,
  fetchGroups,
  fetchInbox,
  fetchParticipant,
  fetchPrivateThread,
  sendPrivateMessage,
} from "../lib/api";

export function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="row" style={{ minHeight: "100vh", justifyContent: "center", color: "var(--muted)", fontSize: 16 }}>
      {children}
    </div>
  );
}

type Tagged = { groupId: number; groupName: string; entry: InboxEntryResponse };
type Candidate = { groupId: number; groupName: string; member: FacMemberResponse };

// The searchable "reach out to someone" picker — a soft popover listing every (group,
// member) pair, so the facilitator can start a conversation with anyone in their groups
// even if no message exists yet.
function ReachOut({
  candidates,
  onPick,
}: {
  candidates: Candidate[];
  onPick: (groupId: number, participantId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  const filtered = q.trim()
    ? candidates.filter((c) => c.member.displayName.toLowerCase().includes(q.trim().toLowerCase()))
    : candidates;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="btn ghost sm icon"
        style={{ width: "100%", justifyContent: "center", padding: "8px 10px", borderColor: "var(--warm)", color: "var(--warm-ink)" }}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="plus" size={15} c="var(--warm)" /> Reach out to someone
      </button>

      {open && (
        <div className="sk soft absolute left-0 right-0 top-full z-30 mt-2 bg-card p-2 text-ink shadow-[0_18px_45px_rgba(68,52,35,0.18)]">
          <div style={{ padding: "4px 4px 8px" }}>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <Icon name="search" size={15} c="var(--muted)" />
              <input
                className="field"
                style={{ flex: 1 }}
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a person…"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">No one to show.</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={`${c.groupId}:${c.member.id}`}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-warm-soft focus:bg-warm-soft focus:outline-none"
                  onClick={() => {
                    onPick(c.groupId, c.member.id);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  <Avatar name={c.member.displayName} size={34} tone={toneFor(c.member.id)} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{c.member.displayName}</span>
                    <span className="block truncate text-xs text-muted">{c.groupName}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function MessagesView() {
  const apiUrl = apiBase();
  const sp = useSearchParams();

  const [groups, setGroups] = useState<FacGroupResponse[]>([]);
  const [tagged, setTagged] = useState<Tagged[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  // Seeded once from ?groupId= (arriving from a group card); later manual changes stick.
  const [groupFilter, setGroupFilter] = useState<number | "all">(() => {
    const g = sp.get("groupId");
    return g && !Number.isNaN(Number(g)) ? Number(g) : "all";
  });

  const [selected, setSelected] = useState<{ groupId: number; participantId: number; kind: "message" | "reflection" } | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [openTab, setOpenTab] = useState<HubTab>("message");

  // Splitter — the left list is the resizable fixed-width pane; the right Hub flexes.
  const [listWidth, setListWidth] = useState(420);
  const [splitterHover, setSplitterHover] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const onSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: listWidth };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = ev.clientX - dragRef.current.startX;
      setListWidth(Math.max(300, Math.min(620, dragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Fetch the inbox for every group and tag each entry with its group.
  const loadInboxes = useCallback(
    async (gs: FacGroupResponse[]): Promise<Tagged[]> => {
      const boxes = await Promise.all(gs.map((g) => fetchInbox(apiUrl, g.groupId)));
      return gs.flatMap((g, i) =>
        boxes[i].map((entry) => ({ groupId: g.groupId, groupName: g.name, entry })),
      );
    },
    [apiUrl],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const gs = await fetchGroups(apiUrl);
        const t = await loadInboxes(gs);
        if (!active) return;
        setGroups(gs);
        setTagged(t);
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [apiUrl, loadInboxes]);

  // Gentle poll so the feed reorders as messages arrive. Leave the rail as-is on a
  // transient failure.
  const refreshInbox = useCallback(async () => {
    try {
      setTagged(await loadInboxes(groups));
    } catch {
      /* keep the last good feed */
    }
  }, [groups, loadInboxes]);

  useEffect(() => {
    if (groups.length === 0) return;
    const id = setInterval(refreshInbox, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [groups, refreshInbox]);

  // Build the enriched Person for a (group, participant) pair — their profile, the private
  // thread in that group, and the reflections they've shared there. A pair with no inbox
  // entry yet (a fresh reach-out) simply has empty messages and reflections.
  const openConversation = useCallback(
    async (groupId: number, participantId: number, tab: HubTab = "message") => {
      setSelected({ groupId, participantId, kind: tab === "reflections" ? "reflection" : "message" });
      setOpenTab(tab);
      try {
        const [p, thread] = await Promise.all([
          fetchParticipant(apiUrl, participantId),
          fetchPrivateThread(apiUrl, groupId, participantId),
        ]);
        const entry = tagged.find((t) => t.groupId === groupId && t.entry.participant.id === participantId)?.entry;
        setPerson({
          ...personFromParticipant(p),
          dm: dmsFrom(thread, facilitatorId),
          reflections: entry
            ? sharedReflections(entry.sharedPrivateNote, entry.sharedFacilitatorNote, entry.sharedFreeWriting, entry.lastReflectionShareAt)
            : [],
          unread: entry?.hasUnread ? 1 : 0,
        });
      } catch {
        /* ignore a transient profile fetch */
      }
    },
    [apiUrl, tagged],
  );

  const replyTo = async (groupId: number, toId: number, body: string) => {
    await sendPrivateMessage(apiUrl, groupId, facilitatorId, toId, body);
    const thread = await fetchPrivateThread(apiUrl, groupId, toId);
    const dm = dmsFrom(thread, facilitatorId);
    setPerson((prev) => (prev ? { ...prev, dm } : prev));
    refreshInbox();
  };

  const closeConversation = () => {
    setSelected(null);
    setPerson(null);
  };

  const candidates = useMemo<Candidate[]>(
    () =>
      groups.flatMap((g) =>
        g.members
          .filter((m) => !isFacilitator(m.role))
          .map((m) => ({ groupId: g.groupId, groupName: g.name, member: m })),
      ),
    [groups],
  );

  const feed = useMemo(() => buildGlobalFeed(tagged), [tagged]);
  const visibleFeed = useMemo(() => {
    const q = query.trim().toLowerCase();
    return feed.filter(
      (f) =>
        (groupFilter === "all" || f.groupId === groupFilter) &&
        (q === "" || f.name.toLowerCase().includes(q)),
    );
  }, [feed, groupFilter, query]);

  if (status === "loading") return <Centered>Loading your messages…</Centered>;
  if (status === "error") return <Centered>We couldn’t reach the server.</Centered>;

  return (
    <div className="row" style={{ height: "100vh", background: "var(--paper)", alignItems: "stretch" }}>
      {/* left — the merged feed */}
      <div className="stack" style={{ width: listWidth, flex: "0 0 auto", minWidth: 0 }}>
        <div className="row" style={{ padding: "16px 18px 12px", gap: 9 }}>
          <Icon name="mail" size={18} c="var(--warm)" />
          <span className="h-title" style={{ fontSize: 22, color: "var(--ink)" }}>
            Messages &amp; reflections
          </span>
        </div>

        {/* group filter */}
        <div className="row" style={{ padding: "0 16px 10px", gap: 7, flexWrap: "wrap" }}>
          <span
            onClick={() => setGroupFilter("all")}
            className={`chip ${groupFilter === "all" ? "solid" : ""}`}
            style={{ fontSize: 13, padding: "5px 12px", cursor: "pointer" }}
          >
            All groups
          </span>
          {groups.map((g) => (
            <span
              key={g.groupId}
              onClick={() => setGroupFilter(g.groupId)}
              className={`chip ${groupFilter === g.groupId ? "solid" : ""}`}
              style={{ fontSize: 13, padding: "5px 12px", cursor: "pointer" }}
            >
              {g.name}
            </span>
          ))}
        </div>

        {/* search + reach out */}
        <div className="stack" style={{ padding: "0 16px 12px", gap: 9 }}>
          <div className="row" style={{ gap: 8, alignItems: "center" }}>
            <Icon name="search" size={16} c="var(--muted)" />
            <input
              className="field"
              style={{ flex: 1 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name…"
            />
          </div>
          <ReachOut candidates={candidates} onPick={(g, p) => openConversation(g, p, "message")} />
        </div>

        <div style={{ borderTop: "2px dashed var(--line)" }} />

        {/* feed */}
        <div className="scroll" style={{ flex: 1, padding: "14px 16px 16px" }}>
          {visibleFeed.length === 0 ? (
            <span style={{ fontSize: 13.5, color: "var(--faint)" }}>Nothing here yet.</span>
          ) : (
            <div className="stack" style={{ gap: 9 }}>
              {visibleFeed.map((item) => (
                <PrivateFeedItem
                  key={`${item.groupId}:${item.id}:${item.kind}`}
                  item={item}
                  showGroup={groupFilter === "all"}
                  selected={selected?.groupId === item.groupId && selected?.participantId === item.id && selected?.kind === item.kind}
                  onOpen={() => openConversation(item.groupId, item.id, item.kind === "message" ? "message" : "reflections")}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* splitter */}
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
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            borderLeft: `1.5px solid ${splitterHover ? "var(--warm)" : "var(--line)"}`,
            transition: "border-color .15s",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 3, opacity: splitterHover ? 1 : 0.35, transition: "opacity .15s" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 10, height: 2.5, borderRadius: 2, background: splitterHover ? "var(--warm)" : "var(--faint)", transition: "background .15s" }} />
          ))}
        </div>
      </div>

      {/* right — the docked conversation, or a gentle blank state */}
      <div className="stack" style={{ flex: 1, minWidth: 0, background: "var(--card)", borderLeft: "2px dashed var(--line)" }}>
        {person && selected ? (
          <Hub
            // Remount when the requested tab changes for the open person, so clicking a
            // message then a reflection (or vice versa) actually switches the Hub's tab —
            // Hub seeds its tab state from the prop only on mount. Manual tab clicks within
            // an open Hub still stick, since openTab doesn't change underneath them.
            key={`${selected.groupId}:${selected.participantId}:${openTab}`}
            variant="docked"
            person={person}
            tab={openTab}
            backLabel="Close"
            backChev
            onClose={closeConversation}
            onSend={(body) => replyTo(selected.groupId, selected.participantId, body)}
          />
        ) : (
          <div className="row" style={{ flex: 1, justifyContent: "center", padding: 30 }}>
            <div className="stack" style={{ alignItems: "center", gap: 12, textAlign: "center", maxWidth: 320 }}>
              <div className="av" style={{ width: 52, height: 52, background: "var(--paper)", borderColor: "var(--line)" }}>
                <Icon name="inbox" size={26} c="var(--muted)" />
              </div>
              <span className="h-title" style={{ fontSize: 20, color: "var(--ink)" }}>
                Pick a conversation
              </span>
              <span style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.5 }}>
                Choose someone on the left to read their messages and reflections, or reach out to start a new conversation.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
