"use client";

// fac view — the facilitator's in-session room (Layout A: a "Privately with you" rail).
// Wired to the live group: the group stream, each member's private thread, and the parts
// of their reflection they've shared. The facilitator posts to the group and replies
// privately. A message in the rail opens that person's message view; a reflection opens
// their reflection view.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { withFid } from "../../lib/identity";
import { dayLabelFor, formatMessageTime, isNewDay } from "../../lib/format";
import { BrandMark } from "../../components/DesignPrimitives";
import { Avatar, DashRule, Icon } from "./Primitives";
import { ConfirmPopup, Overlay } from "./Overlays";
import { Hub, type HubTab } from "./Hub";
import { buildPrivateFeed, PrivateFeedItem, type FeedItem } from "./PrivateFeed";
import { POLL_INTERVAL_MS } from "../../lib/pollIntervals";
import {
  dmsFrom,
  personFromParticipant,
  sharedReflections,
  toneFor,
  type GroupMessageResponse,
  type InboxEntryResponse,
  type Person,
  type Tone,
} from "../lib/data";
import {
  apiBase,
  endSession,
  facilitatorId,
  fetchGroupMessages,
  fetchGroups,
  fetchInbox,
  fetchParticipant,
  fetchPrivateThread,
  fetchSessionState,
  liveGroupId,
  sendGroupMessage,
  sendPrivateMessage,
  SESSION_CLOSED_FOR_WEEK,
  startSession,
} from "../lib/api";

type Mini = { id: number; name: string; tone: Tone };

function Bubble({
  m,
  sender,
  onAvatar,
}: {
  m: GroupMessageResponse;
  sender: Mini | undefined;
  onAvatar: (id: number) => void;
}) {
  const you = m.id === facilitatorId;
  const at = formatMessageTime(m.createdAt);
  const name = you ? "You" : sender?.name ?? "Someone";
  return (
    <article className={`flex gap-3 sm:gap-4 ${you ? "flex-row-reverse" : ""}`}>
      <Avatar
        name={you ? "Sean" : name}
        size={40}
        you={you}
        tone={you ? undefined : sender?.tone ?? toneFor(m.id)}
        onClick={you ? undefined : () => onAvatar(m.id)}
        title={you ? undefined : `Open ${name}'s profile`}
      />
      <div
        className={`flex min-w-0 flex-1 flex-col ${you ? "items-end" : "items-start"}`}
      >
        <div
          className={`mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 ${you ? "justify-end" : ""}`}
        >
          <span
            className="text-sm font-semibold text-ink"
            style={you ? undefined : { cursor: "pointer" }}
            onClick={you ? undefined : () => onAvatar(m.id)}
          >
            {name}
          </span>
          <time className="text-xs text-faint">{at}</time>
        </div>
        <div
          className={`bubble w-fit max-w-full text-[15px] leading-6 text-ink sm:text-base ${you ? "mine" : ""}`}
        >
          {m.body}
        </div>
      </div>
    </article>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="row" style={{ minHeight: "100vh", justifyContent: "center", color: "var(--muted)", fontSize: 16 }}>
      {children}
    </div>
  );
}

type RoomModal =
  | { type: "card"; person: Person; tab: HubTab }
  | { type: "end" }
  | null;

// The "N here with you" chip, made interactive like the participant room's
// participant popover: hover (or click to pin) opens the member list; tapping
// someone opens their profile.
function MembersChip({
  members,
  onOpen,
}: {
  members: Mini[];
  onOpen: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const isOpen = hovered || pinned;

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (pinned && ref.current && !ref.current.contains(e.target as Node)) {
        setPinned(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [pinned]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className="chip cursor-pointer transition hover:border-warm hover:bg-warm-soft"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setPinned((p) => !p)}
      >
        <Icon name="people" size={15} c="var(--muted)" /> {members.length} here with you
      </button>

      {isOpen && (
        <div className="sk soft absolute left-0 top-full z-30 mt-2 w-72 bg-card p-2 text-ink shadow-[0_18px_45px_rgba(68,52,35,0.18)]">
          <div className="flex items-start justify-between gap-3 px-3 py-2">
            <div>
              <p className="leader">In the room</p>
              <p className="mt-1 text-sm text-muted">
                Tap someone to open their profile.
              </p>
            </div>
            {pinned && (
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:bg-warm-soft hover:text-ink"
                aria-label="Close member list"
                onClick={() => setPinned(false)}
              >
                <Icon name="x" size={14} c="var(--muted)" />
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {members.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted">No one here yet.</p>
            ) : (
              members.map((mb) => (
                <button
                  key={mb.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-warm-soft focus:bg-warm-soft focus:outline-none"
                  onClick={() => {
                    onOpen(mb.id);
                    setPinned(false);
                    setHovered(false);
                  }}
                >
                  <Avatar name={mb.name} size={36} tone={mb.tone} />
                  <span className="block min-w-0 truncate text-sm font-semibold text-ink">
                    {mb.name}
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

export function ChatDrawer({ groupId = liveGroupId }: { groupId?: number }) {
  const router = useRouter();
  const apiUrl = apiBase();
  const [groupName, setGroupName] = useState("Friday Group");
  const [duration, setDuration] = useState<number | null>(null);
  const [members, setMembers] = useState<Mini[]>([]);
  const [messages, setMessages] = useState<GroupMessageResponse[]>([]);
  const [inbox, setInbox] = useState<InboxEntryResponse[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "closed">("loading");
  const [modal, setModal] = useState<RoomModal>(null);
  const [draft, setDraft] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(440);
  const [splitterHover, setSplitterHover] = useState(false);
  const [panelCard, setPanelCard] = useState<{ person: Person; tab: HubTab } | null>(null);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Keep the group conversation pinned to the latest message (e.g. right after
  // the facilitator sends one), matching the participant room's behaviour.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const onSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startWidth: panelWidth };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - ev.clientX;
      setPanelWidth(Math.max(300, Math.min(700, dragRef.current.startWidth + delta)));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const loadMessages = useCallback(async () => {
    try {
      setMessages(await fetchGroupMessages(apiUrl, groupId));
    } catch {
      /* keep the last good messages on a transient poll failure */
    }
  }, [apiUrl, groupId]);

  const loadInbox = useCallback(async () => {
    try {
      setInbox(await fetchInbox(apiUrl, groupId));
    } catch {
      /* leave the rail as-is on a transient failure */
    }
  }, [apiUrl, groupId]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [groups, msgs, box, session] = await Promise.all([
          fetchGroups(apiUrl),
          fetchGroupMessages(apiUrl, groupId),
          fetchInbox(apiUrl, groupId),
          fetchSessionState(apiUrl, groupId).catch(() => null),
        ]);
        if (!active) return;
        const live = groups.find((g) => g.groupId === groupId);
        if (live) {
          setGroupName(live.name);
          setDuration(live.scheduledDurationMinutes);
          setMembers(
            live.members
              .filter((m) => m.role.toLowerCase() !== "facilitator")
              .map((m) => ({ id: m.id, name: m.displayName, tone: toneFor(m.id) })),
          );
        }
        // A session can only be held once per scheduled week — once it has been
        // ended, the room stays closed until next time.
        if (session?.sessionClosedForWeek) {
          setStatus("closed");
          return;
        }
        setMessages(msgs);
        setInbox(box);
        setStatus("ready");
        // Entering the room opens the session so participants can join. The backend
        // refuses if this week's session already happened (e.g. a stale deep link).
        startSession(apiUrl, groupId).catch((e: unknown) => {
          if (active && e instanceof Error && e.message === SESSION_CLOSED_FOR_WEEK) {
            setStatus("closed");
          }
        });
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => {
      active = false;
    };
  }, [apiUrl, groupId]);

  useEffect(() => {
    const id = setInterval(() => {
      loadMessages();
      loadInbox();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadMessages, loadInbox]);

  // Load a member's profile + private thread + shared reflections into one enriched Person.
  const buildPerson = async (id: number): Promise<Person> => {
    const [p, thread] = await Promise.all([
      fetchParticipant(apiUrl, id),
      fetchPrivateThread(apiUrl, groupId, id),
    ]);
    const entry = inbox.find((e) => e.participant.id === id);
    return {
      ...personFromParticipant(p),
      dm: dmsFrom(thread, facilitatorId),
      reflections: entry ? sharedReflections(entry.sharedPrivateNote, entry.sharedFacilitatorNote, entry.sharedFreeWriting, entry.lastReflectionShareAt) : [],
      unread: entry?.hasUnread ? 1 : 0,
    };
  };

  // Open the 3-tab profile card as a floating pop-up (from a chat avatar), on whichever
  // tab the click implies.
  const openCard = async (id: number, tab: HubTab) => {
    try {
      setModal({ type: "card", tab, person: await buildPerson(id) });
    } catch {
      /* ignore transient fetch */
    }
  };

  // Open the same profile card in place inside the private panel (from a feed item),
  // replacing the feed until the facilitator steps back.
  const openItemInPanel = async (item: FeedItem) => {
    try {
      setPanelOpen(true);
      setPanelCard({ person: await buildPerson(item.id), tab: item.kind === "message" ? "message" : "reflections" });
    } catch {
      /* ignore transient fetch */
    }
  };

  const replyTo = async (toId: number, body: string) => {
    await sendPrivateMessage(apiUrl, groupId, facilitatorId, toId, body);
    const thread = await fetchPrivateThread(apiUrl, groupId, toId);
    const dm = dmsFrom(thread, facilitatorId);
    setModal((prev) =>
      prev && prev.type === "card" && prev.person.id === toId
        ? { ...prev, person: { ...prev.person, dm } }
        : prev,
    );
    setPanelCard((prev) =>
      prev && prev.person.id === toId ? { ...prev, person: { ...prev.person, dm } } : prev,
    );
    loadInbox();
  };

  const sendToGroup = async () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    await sendGroupMessage(apiUrl, groupId, facilitatorId, body);
    loadMessages();
  };

  if (status === "loading") return <Centered>Opening the room…</Centered>;
  if (status === "error") return <Centered>We couldn’t reach the server.</Centered>;
  if (status === "closed")
    return (
      <Centered>
        <div className="stack" style={{ alignItems: "center", gap: 14, textAlign: "center" }}>
          <span className="h-title" style={{ fontSize: 24, color: "var(--ink)" }}>
            This week’s session has already been held.
          </span>
          <span style={{ fontSize: 15.5, maxWidth: 420, lineHeight: 1.5 }}>
            {groupName ? `${groupName} will` : "The group will"} meet again at its
            usual time next week - the room stays closed until then.
          </span>
          <button className="btn warm" onClick={() => router.push(withFid("/facilitator"))}>
            Back to your groups
          </button>
        </div>
      </Centered>
    );

  const feed = buildPrivateFeed(inbox, groupId);
  const byId = new Map(members.map((m) => [m.id, m] as const));

  return (
    <div className="stack" style={{ height: "100vh", background: "var(--paper)", position: "relative" }}>
      <header className="shrink-0 border-b-2 border-dashed border-line bg-card">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <BrandMark />
            <span
              aria-hidden
              className="hidden sm:block"
              style={{ width: 1, height: 34, background: "var(--line)" }}
            />
            <div>
              <p className="leader">tonight&apos;s room</p>
              <h1 className="h-title text-2xl text-ink sm:text-[28px]">{groupName}</h1>
            </div>
            <MembersChip
              members={members}
              onOpen={(id) => openCard(id, "about")}
            />
            {duration && (
              <span className="chip">
                <Icon name="clock" size={15} c="var(--muted)" /> {duration} minutes together
              </span>
            )}
          </div>
          <button className="btn red-ghost sm" onClick={() => setModal({ type: "end" })}>
            <Icon name="x" size={15} /> End the session
          </button>
        </div>
      </header>
      <div className="row" style={{ flex: 1, minHeight: 0, alignItems: "stretch" }}>
        <div className="scroll" style={{ flex: 1, padding: "26px 40px" }}>
          <div className="mx-auto flex max-w-3xl flex-col gap-5">
            {messages.length === 0 ? (
              <div className="sk thin soft dash bg-paper p-6 text-center text-[15px] leading-relaxed text-muted">
                No messages yet.
              </div>
            ) : (
              messages.map((m, i) => {
                const dateLabel = isNewDay(messages[i - 1]?.createdAt, m.createdAt)
                  ? dayLabelFor(m.createdAt)
                  : null;
                return (
                  <div key={i} className="flex flex-col gap-5">
                    {dateLabel && (
                      <div className="flex justify-center" aria-hidden="true">
                        <span className="chip px-3 py-0.5 text-[12px] text-faint">
                          {dateLabel}
                        </span>
                      </div>
                    )}
                    <Bubble
                      m={m}
                      sender={byId.get(m.id)}
                      onAvatar={(id) => openCard(id, "about")}
                    />
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>
        </div>

        {panelOpen && (
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
        )}
        {panelOpen ? (
          <div className="stack" style={{ width: panelWidth, flex: "0 0 auto", background: "var(--paper)", paddingRight: 18 }}>
            {panelCard ? (
              /* a tapped message/reflection, opened in place — step back to return to the feed */
              <Hub
                variant="docked"
                person={panelCard.person}
                tab={panelCard.tab}
                backLabel="Back"
                backChev
                onClose={() => setPanelCard(null)}
                onSend={(body) => replyTo(panelCard.person.id, body)}
              />
            ) : (
              <>
                {/* header */}
                <div className="row" style={{ padding: "16px 18px 12px", gap: 9 }}>
                  <Icon name="lock" size={17} c="var(--warm)" />
                  <span className="h-title" style={{ fontSize: 20, color: "var(--ink)", whiteSpace: "nowrap" }}>
                    Privately with you
                  </span>
                  <div style={{ flex: 1 }} />
                  <button
                    className="btn ghost icon sm"
                    title="Hide this panel"
                    onClick={() => setPanelOpen(false)}
                    style={{ borderColor: "var(--line)" }}
                  >
                    <Icon name="chev" size={15} c="var(--muted)" />
                  </button>
                </div>

                {/* legend */}
                <div className="row" style={{ padding: "0 18px 10px", gap: 16 }}>
                  <span className="row" style={{ gap: 6, fontSize: 12, color: "var(--warm-ink)" }}>
                    <span className="dot warm" /> message
                  </span>
                  <span className="row" style={{ gap: 6, fontSize: 12, color: "var(--sky-ink)" }}>
                    <span className="dot sky" /> reflection
                  </span>
                </div>
                <DashRule />

                {/* one feed */}
                <div className="scroll" style={{ flex: 1, padding: "14px 16px 16px" }}>
                  {feed.length === 0 ? (
                    <span style={{ fontSize: 13.5, color: "var(--faint)" }}>Nothing private yet.</span>
                  ) : (
                    <div className="stack" style={{ gap: 9 }}>
                      {feed.map((item, i) => (
                        <PrivateFeedItem key={`${item.kind}-${item.id}-${i}`} item={item} showGroup={false} onOpen={() => openItemInPanel(item)} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            className="stack"
            onClick={() => setPanelOpen(true)}
            title="Show the private panel"
            style={{
              width: 56,
              flex: "0 0 auto",
              borderLeft: "2px dashed var(--line)",
              background: "var(--card)",
              alignItems: "center",
              padding: "18px 0",
              gap: 12,
              cursor: "pointer",
            }}
          >
            <button
                className="btn ghost icon sm"
                title="Show the private panel"
                onClick={() => setPanelOpen(true)}
                style={{ borderColor: "var(--line)" }}
              >
            <Icon name="chev" size={16} c="var(--muted)" style={{ transform: "rotate(180deg)" }} />
            </button>
            <Icon name="lock" size={18} c="var(--warm)" />
            <span className="h-title" style={{ writingMode: "vertical-rl", fontSize: 20, color: "var(--muted)" }}>
              Privately with you
            </span>
          </div>
        )}
      </div>
      <footer className="shrink-0 border-t-2 border-dashed border-line bg-card px-4 py-4 sm:px-5">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <input
            className="field min-h-12 flex-1 !rounded-full px-5"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendToGroup()}
            placeholder={`Share something with the ${groupName}…`}
          />
          <button
            className="btn warm inline-flex h-12 min-w-12 items-center justify-center gap-2 !rounded-full px-5"
            onClick={sendToGroup}
            disabled={!draft.trim()}
            aria-label="Send message"
          >
            <Icon name="send" size={18} c="#fff" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </footer>

      {modal && (
        <Overlay onClose={() => setModal(null)}>
          {modal.type === "card" && (
            <Hub
              variant="card"
              person={modal.person}
              tab={modal.tab}
              onClose={() => setModal(null)}
              onSend={(body) => replyTo(modal.person.id, body)}
            />
          )}
          {modal.type === "end" && (
            <ConfirmPopup
              icon="x"
              accent="var(--red)"
              title="End tonight’s session?"
              body="Everyone is told the group is closing for tonight and gently returned home. Private messages from this session won’t carry over."
              confirm="End session"
              cancel="Stay a little longer"
              onClose={() => setModal(null)}
              onConfirm={async () => {
                // Closing the session removes everyone still in the room.
                await endSession(apiUrl, groupId).catch(() => {});
                router.push(withFid("/facilitator"));
              }}
            />
          )}
        </Overlay>
      )}
    </div>
  );
}
