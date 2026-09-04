"use client";

// fac view — full-window group detail page (two-column: members + private notes) and
// the per-group notes popup (opened from the home card's note icon).

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { withFid } from "../../lib/identity";
import { formatTimeSince } from "../../lib/format";
import { Avatar, DashRule, Field, Icon, SoftLabel, type IconName } from "./Primitives";
import { CircleBadge, CloseBtn, ConfirmPopup, HobbyChips, LostCategory, LostChip, Overlay, PopBlock } from "./Overlays";
import { Hub } from "./Hub";
import { InvitePanel } from "./Invite";
import {
  dmsFrom,
  groupCardFrom,
  personFromParticipant,
  sharedReflections,
  type GroupCard,
  type Person,
} from "../lib/data";
import {
  apiBase,
  deleteGroup,
  facilitatorId,
  fetchGroupNotes,
  fetchGroups,
  fetchInbox,
  fetchNotePrompts,
  fetchParticipant,
  fetchPrivateThread,
  fetchSessionState,
  updateGroupNotes,
  updateNotePrompts,
  type GroupNotesResponse,
} from "../lib/api";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="row" style={{ minHeight: "60vh", justifyContent: "center", color: "var(--muted)", fontSize: 16 }}>
      {children}
    </div>
  );
}

// ====================================================================== NOTES EDITOR
// Self-contained read/edit component for a group's private notes.
// Read mode: shows notes in handwriting font (or dashed empty state) + Edit/Write button.
// Edit mode: textarea + Save / Cancel buttons.

function NotesEditor({
  groupId,
  minHeight = 220,
  autoEdit = false,
}: {
  groupId: number;
  minHeight?: number;
  autoEdit?: boolean;
}) {
  const apiUrl = apiBase();
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let active = true;
    fetchGroupNotes(apiUrl, groupId)
      .then((res) => {
        if (!active) return;
        setNotes(res.notes);
        setLoaded(true);
        if (autoEdit && !res.notes.trim()) {
          setDraft("");
          setEditing(true);
        }
      })
      .catch(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [apiUrl, groupId, autoEdit]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      const v = el.value;
      el.value = "";
      el.value = v;
    }
  }, [editing]);

  const start = () => { setDraft(notes); setEditing(true); };
  const cancel = () => { setDraft(notes); setEditing(false); };

  const commit = async () => {
    setSaving(true);
    try {
      const res: GroupNotesResponse = await updateGroupNotes(apiUrl, groupId, draft);
      setNotes(res.notes);
      setEditing(false);
      setFlash(true);
      setTimeout(() => setFlash(false), 1800);
    } catch {
      /* ignore — user can retry */
    } finally {
      setSaving(false);
    }
  };

  const has = !!notes.trim();

  if (!loaded) {
    return <span style={{ fontSize: 14, color: "var(--muted)" }}>Loading…</span>;
  }

  if (editing) {
    return (
      <div className="stack" style={{ gap: 12 }}>
        <textarea
          ref={textareaRef}
          className="field calm"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What do you want to remember about this group? Who to check in with, what landed, what to try next time…"
          style={{
            width: "100%",
            minHeight,
            resize: "vertical",
            fontFamily: "var(--hand)",
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--ink)",
            display: "block",
          }}
        />
        <div className="row" style={{ gap: 10 }}>
          <button className="btn calm sm" onClick={commit} disabled={saving}>
            <Icon name="check" size={15} c="#fff" /> Save notes
          </button>
          {has && (
            <button className="btn ghost sm" onClick={cancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ gap: 13 }}>
      {has ? (
        <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--hand)", fontSize: 16, lineHeight: 1.62, color: "var(--ink)" }}>
          {notes}
        </div>
      ) : (
        <div
          className="sk thin soft"
          style={{ padding: "20px 16px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}
        >
          Nothing jotted yet. After your next session, note who to check in with or what landed.
        </div>
      )}
      <div className="row" style={{ gap: 11 }}>
        <button className="btn ghost sm" onClick={start}>
          <Icon name="pen" size={15} c="var(--muted)" /> {has ? "Edit notes" : "Write a note"}
        </button>
        {flash && (
          <span className="row" style={{ gap: 6, fontSize: 14, color: "var(--calm-ink)" }}>
            <Icon name="check" size={14} c="var(--calm)" /> saved
          </span>
        )}
      </div>
    </div>
  );
}

// ====================================================================== DETAIL SECTION
// One reflective, facilitator-private card used for all three things they keep in hand about
// a group: why it exists, anything to keep a gentle eye on, and their running notes. Read mode
// shows the value in the readable body font; Edit sits at the top-right of the header. It is
// presentational — value + onSave come from the parent (the two prompt fields share one PATCH).

function DetailSection({
  icon,
  title,
  value,
  loaded,
  onSave,
  placeholder,
  empty,
  minHeight = 200,
}: {
  icon: IconName;
  title: string;
  value: string;
  loaded: boolean;
  onSave: (draft: string) => Promise<void>;
  placeholder: string;
  empty: string;
  minHeight?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus();
      const v = el.value;
      el.value = "";
      el.value = v;
    }
  }, [editing]);

  const has = !!value.trim();
  const start = () => { setDraft(value); setEditing(true); };
  const cancel = () => { setDraft(value); setEditing(false); };
  const commit = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
      setFlash(true);
      setTimeout(() => setFlash(false), 1800);
    } catch {
      /* ignore — user can retry */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sk v2 soft" style={{ padding: "18px 20px", background: "var(--card)" }}>
      <div className="row" style={{ gap: 13, alignItems: "flex-start" }}>
        <div className="av" style={{ width: 44, height: 44, background: "var(--calm-soft)", borderColor: "var(--calm)" }}>
          <Icon name={icon} size={22} c="var(--calm-ink)" />
        </div>
        <div className="stack" style={{ gap: 3, flex: 1, minWidth: 0, paddingTop: 1 }}>
          <span className="h-title" style={{ fontSize: 21, color: "var(--ink)" }}>{title}</span>
          <span className="row" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>
            <Icon name="lock" size={13} c="var(--calm)" /> Private to you
          </span>
        </div>
        {loaded && has && !editing && (
          <button className="btn ghost sm" onClick={start} style={{ flexShrink: 0 }}>
            <Icon name="pen" size={14} c="var(--muted)" /> Edit
          </button>
        )}
      </div>

      <div style={{ marginTop: 14 }}>
        {!loaded ? (
          <span style={{ fontSize: 14, color: "var(--muted)" }}>Loading…</span>
        ) : editing ? (
          <div className="stack" style={{ gap: 12 }}>
            <textarea
              ref={textareaRef}
              className="field calm"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={placeholder}
              style={{
                width: "100%",
                minHeight,
                resize: "vertical",
                fontFamily: "var(--hand)",
                fontSize: 16,
                lineHeight: 1.62,
                color: "var(--ink)",
                display: "block",
              }}
            />
            <div className="row" style={{ gap: 10 }}>
              <button className="btn calm sm" onClick={commit} disabled={saving}>
                <Icon name="check" size={15} c="#fff" /> Save
              </button>
              {has && (
                <button className="btn ghost sm" onClick={cancel}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ) : has ? (
          <div className="stack" style={{ gap: 13 }}>
            <div style={{ whiteSpace: "pre-wrap", fontFamily: "var(--hand)", fontSize: 16, lineHeight: 1.62, color: "var(--ink)" }}>
              {value}
            </div>
            {flash && (
              <span className="row" style={{ gap: 6, fontSize: 14, color: "var(--calm-ink)" }}>
                <Icon name="check" size={14} c="var(--calm)" /> saved
              </span>
            )}
          </div>
        ) : (
          <div className="stack" style={{ gap: 13 }}>
            <div
              className="sk thin soft"
              style={{ padding: "20px 16px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}
            >
              {empty}
            </div>
            <div className="row" style={{ gap: 11 }}>
              <button className="btn ghost sm" onClick={start}>
                <Icon name="pen" size={15} c="var(--muted)" /> Write a note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ====================================================================== GROUP NOTE SECTIONS
// The three facilitator-private sections shown at the top of both group-detail surfaces. Fetches
// the free-form notes + the two prompts once, owns their state, and wires each section's save.
// The two prompts share one PATCH, so each prompt save sends the current pair to avoid wiping
// the other field.

function GroupNoteSections({ groupId }: { groupId: number }) {
  const apiUrl = apiBase();
  const [notes, setNotes] = useState("");
  const [reason, setReason] = useState("");
  const [safeg, setSafeg] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([fetchGroupNotes(apiUrl, groupId), fetchNotePrompts(apiUrl, groupId)])
      .then(([n, p]) => {
        if (!active) return;
        setNotes(n.notes);
        setReason(p.creationReason);
        setSafeg(p.safeguardingConcerns);
        setLoaded(true);
      })
      .catch(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [apiUrl, groupId]);

  const saveReason = async (draft: string) => {
    await updateNotePrompts(apiUrl, groupId, { creationReason: draft, safeguardingConcerns: safeg });
    setReason(draft);
  };
  const saveNotes = async (draft: string) => {
    const res = await updateGroupNotes(apiUrl, groupId, draft);
    setNotes(res.notes);
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <DetailSection
        icon="heart"
        title="Why this group exists"
        value={reason}
        loaded={loaded}
        onSave={saveReason}
        minHeight={140}
        placeholder="Why did you start this group? What were you hoping to make room for - and what would you want to remember?"
        empty="Note why you started this group - something to ground yourself before a session."
      />
      <DetailSection
        icon="note"
        title="Your private notes"
        value={notes}
        loaded={loaded}
        onSave={saveNotes}
        minHeight={200}
        placeholder="What do you want to remember about this group? Who to check in with, what landed, what to try next time…"
        empty="Nothing jotted yet. After your next session, note who to check in with or what landed."
      />
    </div>
  );
}

// ====================================================================== GROUP NOTES POPUP
// Focused popup opened from the home card's note icon button.

export function GroupNotesPopup({
  groupId,
  groupName,
  onClose,
}: {
  groupId: number;
  groupName: string;
  onClose: () => void;
}) {
  return (
    <div
      className="sk"
      style={{
        width: 540,
        maxWidth: "100%",
        maxHeight: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      <div className="row" style={{ padding: "18px 22px 14px", gap: 13, alignItems: "flex-start" }}>
        <div className="av" style={{ width: 44, height: 44, background: "var(--calm-soft)", borderColor: "var(--calm)" }}>
          <Icon name="note" size={22} c="var(--calm-ink)" />
        </div>
        <div className="stack" style={{ gap: 2, flex: 1, paddingTop: 1 }}>
          <span className="h-title" style={{ fontSize: 23, color: "var(--ink)" }}>
            Your notes · {groupName}
          </span>
          <span className="row" style={{ gap: 6, fontSize: 13, color: "var(--muted)" }}>
            <Icon name="lock" size={13} c="var(--calm)" /> private to you · never shared with the group
          </span>
        </div>
        <CloseBtn onClick={onClose} />
      </div>
      <DashRule />
      <div className="scroll" style={{ padding: "18px 22px 22px" }}>
        <NotesEditor groupId={groupId} minHeight={220} autoEdit />
      </div>
    </div>
  );
}

// ====================================================================== GROUP DETAIL PAGE

type DetailModal =
  | { type: "member"; person: Person }
  | { type: "invite" }
  | { type: "delete" }
  | null;

function DetailMemberRow({
  p,
  expanded,
  onOpenProfile,
  onToggle,
}: {
  p: Person;
  expanded: boolean;
  onOpenProfile: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="sk thin soft" style={{ padding: "13px 16px" }}>
      {/* band */}
      <div className="row" style={{ alignItems: "center", gap: 14 }}>
        {/* avatar + name + meta → opens the profile popup (messages, reflections) */}
        <div
          className="row fac-tap"
          onClick={onOpenProfile}
          title={`Open ${p.name}'s profile`}
          style={{ gap: 14, flex: 1, minWidth: 0, cursor: "pointer" }}
        >
          <Avatar name={p.name} size={42} tone={p.tone} />
          <div className="stack" style={{ gap: 2, flex: 1, minWidth: 0 }}>
            <span className="h-title" style={{ fontSize: 19, color: "var(--ink)" }}>{p.name}</span>
            <span style={{ fontSize: 13.5, color: "var(--muted)" }}>
              {[p.pronouns, p.age].filter(Boolean).join(" · ") || "—"}
            </span>
          </div>
        </div>

        {/* grief + duration, centred — slides + fades away once the profile is expanded below */}
        <div
          className="stack"
          style={{
            gap: 4,
            alignItems: "center",
            flexShrink: 0,
            overflow: "hidden",
            opacity: expanded ? 0 : 1,
            maxWidth: expanded ? 0 : 360,
            transition: "opacity 0.22s ease, max-width 0.22s ease",
          }}
        >
          <SoftLabel c="var(--warm-ink)">Who they lost</SoftLabel>
          <div className="row" style={{ gap: 8 }}>
            <LostChip m={p} size={12.5} />
            {p.recency && (
              <span className="chip" style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
                <Icon name="clock" size={12} c="var(--muted)" /> {p.recency.toLowerCase()}
              </span>
            )}
          </div>
        </div>

        {/* its own button — toggles the inline profile, pinned to the far right */}
        <div className="row" style={{ flex: 1, justifyContent: "flex-end" }}>
          <button
            className="btn ghost icon fac-tap"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? `Hide ${p.name}'s profile` : `Show ${p.name}'s profile`}
            style={{ flexShrink: 0 }}
          >
            <span style={{ display: "inline-flex", transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s ease" }}>
              <Icon name="chev" size={16} c="var(--muted)" />
            </span>
          </button>
        </div>
      </div>

      {/* inline profile — the placing-logic "About" view, smooth height */}
      <div style={{ display: "grid", gridTemplateRows: expanded ? "1fr" : "0fr", transition: "grid-template-rows 0.25s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <div className="stack" style={{ gap: 16, paddingTop: 16 }}>
            {p.fact && (
              <PopBlock icon="spark" label="A fact about them" accent="var(--warm-ink)" skin="v3" tint="var(--warm-soft)">
                {p.fact}
              </PopBlock>
            )}
            <div className="sk v2" style={{ padding: "20px 22px" }}>
              <SoftLabel style={{ marginBottom: 16 }}>What they’re carrying & a little about them</SoftLabel>
              <div className="stack" style={{ gap: 16 }}>
                <div className="stack" style={{ gap: 8 }}>
                  <SoftLabel c="var(--warm-ink)">Who they lost</SoftLabel>
                  <LostCategory m={p} />
                </div>
                <DashRule />
                <div className="stack" style={{ gap: 9 }}>
                  <SoftLabel>Hobbies</SoftLabel>
                  <HobbyChips items={p.hobbies} />
                </div>
                <Field label="Cultural background">
                  {p.culture && p.culture !== "—" ? p.culture : "they’d rather not say"}
                </Field>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================================== GROUP DETAIL POPUP
// A wide pop-up that mirrors the full group detail page (title, info chips, private notes,
// expandable member rows) but without the edit/close-group controls — opened from the
// arrival placing page's "Group details". Its one action invites this arrival in.
// Members expand inline rather than opening a nested overlay.

export function GroupDetailPopup({
  group,
  personName,
  onInvite,
  onClose,
}: {
  group: GroupCard;
  personName: string;
  onInvite: () => void;
  onClose: () => void;
}) {
  const apiUrl = apiBase();
  const [people, setPeople] = useState<Person[] | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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

  const memberCount = people?.length ?? group.members.length;

  return (
    <div
      className="sk"
      style={{
        width: 820,
        maxWidth: "100%",
        maxHeight: "100%",
        background: "var(--paper)",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 18px 50px rgba(58,45,30,.20)",
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div className="row" style={{ padding: "20px 24px 16px", gap: 14, alignItems: "flex-start" }}>
        <div className="av" style={{ width: 48, height: 48, background: "var(--warm-soft)", borderColor: "var(--warm)" }}>
          <Icon name="people" size={24} c="var(--warm)" />
        </div>
        <div className="stack" style={{ gap: 6, flex: 1, paddingTop: 1 }}>
          <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>
            <h2 className="h-title" style={{ fontSize: 28, color: "var(--ink)" }}>{group.name}</h2>
            <CircleBadge c={group} />
          </div>
          <div className="row" style={{ gap: 9, flexWrap: "wrap" }}>
            <span className="chip">
              <Icon name="cal" size={14} c="var(--muted)" /> {group.when}
            </span>
            {group.durationMinutes != null && (
              <span className="chip">
                <Icon name="clock" size={14} c="var(--muted)" /> {group.durationMinutes} min
              </span>
            )}
            <span className="chip">
              <Icon name="people" size={14} c="var(--muted)" /> {memberCount} {memberCount === 1 ? "person" : "people"}
            </span>
            {group.createdAt && (
              <span className="chip">
                <Icon name="spark" size={14} c="var(--muted)" /> created {formatTimeSince(group.createdAt)}
              </span>
            )}
          </div>
        </div>
        <CloseBtn onClick={onClose} />
      </div>
      <DashRule />

      {/* body — the facilitator's private sections, then members, mirroring the full page */}
      <div className="scroll" style={{ flex: 1, padding: "20px 24px 22px" }}>
        <div className="stack" style={{ gap: 20 }}>
          <GroupNoteSections groupId={group.groupId} />

          <div className="stack" style={{ gap: 12 }}>
            <SoftLabel>
              {people && people.length > 0 ? "Everyone in this group · expand a name for their profile" : "Members"}
            </SoftLabel>
            {people === null ? (
              <span style={{ fontSize: 14, color: "var(--muted)" }}>Loading members…</span>
            ) : people.length === 0 ? (
              <div
                className="sk thin soft"
                style={{ padding: "22px 18px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}
              >
                No one has been placed in this group yet.
              </div>
            ) : (
              <div className="stack" style={{ gap: 10 }}>
                {people.map((p) => (
                  <DetailMemberRow
                    key={p.id}
                    p={p}
                    expanded={open.has(p.id)}
                    onOpenProfile={() => toggle(p.id)}
                    onToggle={() => toggle(p.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* footer — the one action: invite this arrival in */}
      <DashRule />
      <div className="row" style={{ padding: "13px 24px" }}>
        <div style={{ flex: 1 }} />
        <button className="btn warm" onClick={onInvite}>
          <Icon name="mail" size={16} c="#fff" /> Add {personName}
        </button>
      </div>
    </div>
  );
}

export function GroupDetailPage({ groupId }: { groupId: number }) {
  const router = useRouter();
  const apiUrl = apiBase();

  const [group, setGroup] = useState<GroupCard | null>(null);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [modal, setModal] = useState<DetailModal>(null);
  const [deleting, setDeleting] = useState(false);
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const close = () => setModal(null);
  const reload = () => setTick((t) => t + 1);
  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const gs = await fetchGroups(apiUrl);
        const found = gs.find((g) => g.groupId === groupId);
        if (!found) { if (active) setStatus("error"); return; }
        const session = await fetchSessionState(apiUrl, groupId).catch(() => null);
        const card = groupCardFrom(found, session?.sessionClosedForWeek ?? false);
        if (!active) return;
        setGroup(card);

        const ps = await Promise.all(card.members.map((m) => fetchParticipant(apiUrl, m.id)));
        if (!active) return;
        setPeople(ps.map(personFromParticipant));
        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();
    return () => { active = false; };
  }, [apiUrl, groupId, tick]);

  const openMember = async (id: number) => {
    if (!group) return;
    try {
      const [p, thread, inbox] = await Promise.all([
        fetchParticipant(apiUrl, id),
        fetchPrivateThread(apiUrl, groupId, id),
        fetchInbox(apiUrl, groupId),
      ]);
      const entry = inbox.find((e) => e.participant.id === id);
      setModal({
        type: "member",
        person: {
          ...personFromParticipant(p),
          dm: dmsFrom(thread, facilitatorId),
          reflections: entry ? sharedReflections(entry.sharedPrivateNote, entry.sharedFacilitatorNote, entry.sharedFreeWriting, entry.lastReflectionShareAt) : [],
          unread: entry?.hasUnread ? 1 : 0,
        },
      });
    } catch {
      /* ignore */
    }
  };

  const confirmDelete = async () => {
    if (!group) return;
    setDeleting(true);
    try {
      await deleteGroup(apiUrl, groupId);
      router.push(withFid("/facilitator"));
    } catch {
      setDeleting(false);
      close();
    }
  };

  const memberCount = people?.length ?? group?.members.length ?? 0;

  return (
    <div className="stack" style={{ minHeight: "100%", background: "var(--paper)", position: "relative" }}>
      <div className="scroll" style={{ flex: 1, padding: "26px 32px 32px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* Slim, calm back link — matches the arrivals page. */}
          <button
            className="btn ghost sm"
            onClick={() => router.push(withFid("/facilitator"))}
            style={{ border: "none", padding: "3px 6px", marginLeft: -6, marginBottom: 16, color: "var(--muted)" }}
          >
            <Icon name="back" size={15} c="var(--muted)" /> Back to my groups
          </button>
          {status === "loading" && <Centered>Loading…</Centered>}
          {status === "error" && <Centered>We couldn’t find that group.</Centered>}

          {status === "ready" && group && (
            <>
              {/* title block */}
              <div className="row" style={{ gap: 30, alignItems: "center", flexWrap: "wrap" }}>
                <div
                  className="av"
                  style={{ width: 48, height: 48, background: "var(--warm-soft)", borderColor: "var(--warm)", alignSelf: "center" }}
                >
                  <Icon name="people" size={24} c="var(--warm)" />
                </div>
                <h2 className="h-title" style={{ fontSize: 33, color: "var(--ink)" }}>{group.name}</h2>
                <CircleBadge c={group} />

                <div className="row" style={{ gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <button className="btn warm sm" onClick={() => setModal({ type: "invite" })}>
                    <Icon name="mail" size={15} c="#fff" /> Add someone
                  </button>
                  <button className="btn ghost sm" onClick={() => router.push(withFid(`/facilitator/groups/${groupId}/edit`))}>
                    <Icon name="pen" size={15} c="var(--muted)" /> Edit details
                  </button>
                  <button
                    className="btn red-ghost sm"
                    onClick={() => setModal({ type: "delete" })}
                  >
                    <Icon name="x" size={15} />
                    Close group
                  </button>
                </div>
              </div>

              {/* info chips */}
              <div className="row" style={{ gap: 9, marginTop: 16, flexWrap: "wrap" }}>
                <span className="chip">
                  <Icon name="cal" size={14} c="var(--muted)" /> {group.when}
                </span>
                {group.durationMinutes != null && (
                  <span className="chip">
                    <Icon name="clock" size={14} c="var(--muted)" /> {group.durationMinutes} min
                  </span>
                )}
                <span className="chip">
                  <Icon name="people" size={14} c="var(--muted)" /> {memberCount} {memberCount === 1 ? "person" : "people"}
                </span>
                {group.createdAt && (
                  <span className="chip">
                    <Icon name="spark" size={14} c="var(--muted)" /> created {formatTimeSince(group.createdAt)}
                  </span>
                )}
              </div>

              {/* description
              {group.description && (
                <p style={{ fontSize: 16.5, color: "var(--ink)", lineHeight: 1.55, margin: "16px 0 0", maxWidth: 720 }}>
                  {group.description}
                </p>
              )} */}

              {/* the facilitator's private sections, then members, stacked */}
              <div className="stack" style={{ gap: 20, marginTop: 24 }}>

                <GroupNoteSections groupId={groupId} />

                {/* members */}
                <div className="stack" style={{ gap: 12 }}>
                  <SoftLabel>
                    {people && people.length > 0
                      ? "Everyone in this group · open a name to message them, or expand for their profile"
                      : "Members"}
                  </SoftLabel>
                  {people === null ? (
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>Loading members…</span>
                  ) : people.length === 0 ? (
                    <div
                      className="sk thin soft"
                      style={{ padding: "22px 18px", textAlign: "center", color: "var(--muted)", fontSize: 15.5, borderStyle: "dashed" }}
                    >
                      No one has been placed in this group yet.
                    </div>
                  ) : (
                    <div className="stack" style={{ gap: 10 }}>
                      {people.map((p) => (
                        <DetailMemberRow
                          key={p.id}
                          p={p}
                          expanded={open.has(p.id)}
                          onOpenProfile={() => openMember(p.id)}
                          onToggle={() => toggle(p.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </>
          )}
        </div>
      </div>

      {modal && (
        <Overlay onClose={close}>
          {modal.type === "member" && (
            <Hub
              variant="card"
              person={modal.person}
              onClose={close}
              backLabel={group?.name ?? "Group"}
            />
          )}
          {modal.type === "invite" && group && (
            <InvitePanel group={group} onClose={close} onPlaced={() => { close(); reload(); }} />
          )}
          {modal.type === "delete" && group && (
            <ConfirmPopup
              icon="x"
              accent="var(--red)"
              title={`Close ${group.name}?`}
              body="The group closes and the meetings stop. This can't be undone, are you sure you want to close it?"
              confirm={deleting ? "Closing…" : "Close group"}
              cancel="Keep it"
              onClose={close}
              onConfirm={confirmDelete}
            />
          )}
        </Overlay>
      )}
    </div>
  );
}
