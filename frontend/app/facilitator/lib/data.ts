// Facilitator view model + mappers.
//
// The facilitator screens are wired to the real backend (see ./api.ts). This module
// holds the TypeScript shapes for the API responses, the view-model the presentational
// components consume, the icon maps, and the small helpers that translate between them —
// in particular the grief mapping, which keeps "who they lost" a single, mutually
// exclusive value.

import { formatMessageTime, formatSessionSchedule, formatTimeSince } from "../../lib/format";
import type { IconName } from "../components/Primitives";

export type Tone = "warm" | "calm" | "sky";

// ----------------------------------------------------------------- API responses
export type FacMemberResponse = {
  id: number;
  displayName: string;
  initials: string;
  pronouns: string | null;
  role: string;
};

export type FacGroupResponse = {
  groupId: number;
  name: string;
  dayOfWeek: string;
  scheduledTime: string;
  scheduledDurationMinutes: number;
  creationTime: string;
  description: string | null;
  members: FacMemberResponse[];
};

export type FacParticipantResponse = {
  id: number;
  displayName: string;
  pronouns: string | null;
  age: string | null;
  initials: string;
  fact: string;
  hobbies: string[];
  culturalBackground: string | null;
  griefRecency: string | null;
  whoLost: string | null;
  role: string;
  onboardingTime: string;
  groupId: number | null;
};

export type InboxEntryResponse = {
  participant: FacMemberResponse;
  lastMessageBody: string | null;
  lastMessageFromId: number | null;
  lastMessageAt: string | null;
  hasUnread: boolean;
  sharedPrivateNote: string | null;
  sharedFacilitatorNote: string | null;
  sharedFreeWriting: string | null;
  lastReflectionShareAt: string | null;
};

export type FacMessageResponse = {
  fromId: number;
  toId: number;
  body: string;
  createdAt: string;
};

export type GroupMessageResponse = {
  id: number; // sender participant id
  body: string;
  createdAt: string;
};

// ----------------------------------------------------------------- grief
export type GriefCategory =
  | "Family"
  | "Partner"
  | "Friend"
  | "Pet"
  | "In their own words"
  | "I’d rather not say";

export const LOST_ICON: Record<GriefCategory, IconName> = {
  Family: "people",
  Partner: "heart",
  Friend: "mug",
  Pet: "paw",
  "In their own words": "pen",
  "I’d rather not say": "lock",
};

export const HOBBY_ICON: Record<string, IconName> = {
  Music: "music",
  Reading: "note",
  Cooking: "mug",
  Painting: "palette",
  Games: "spark",
  "Being outside": "leaf",
  "Films & TV": "eye",
};

/* "Who they lost" is a single, mutually-exclusive value. The backend stores one
   string in `who_lost`; we map it to exactly one category (never a category AND
   free text). A value matching a fixed category is that category; "rather not say"
   is its own category; anything else is the person's own words. */
export function griefFor(whoLost: string | null | undefined): {
  cat: GriefCategory | null;
  words: string | null;
} {
  const raw = (whoLost ?? "").trim();
  if (!raw) return { cat: null, words: null };
  const key = raw.toLowerCase().replace(/[_\s]+/g, " ").trim();
  if (key === "family") return { cat: "Family", words: null };
  if (key === "partner") return { cat: "Partner", words: null };
  if (key === "friend") return { cat: "Friend", words: null };
  if (key === "pet") return { cat: "Pet", words: null };
  if (key === "rather not say" || key === "i'd rather not say" || key === "i’d rather not say")
    return { cat: "I’d rather not say", words: null };
  return { cat: "In their own words", words: raw };
}

// short label for "time since bereaved" — used in compact previews
export function sinceShort(recency: string | null | undefined): string {
  if (!recency) return "";
  return (
    {
      "In the last few weeks": "weeks ago",
      "A few months ago": "months ago",
      "Longer ago": "longer ago",
    }[recency] || recency
  );
}

// ----------------------------------------------------------------- view model
// atIso is the raw timestamp, kept alongside the formatted label so threads can
// insert per-day date separators.
export type DM = { from: "you" | "them"; t: string; at: string; atIso: string };
export type Reflection = { q: string; a: string; at: string | null; atIso: string | null };

export type Person = {
  id: number;
  name: string;
  tone: Tone;
  initials: string;
  pronouns: string | null;
  age: string | null;
  fact: string;
  hobbies: string[];
  culture: string | null;
  lostCat: GriefCategory | null;
  lostWords: string | null;
  recency: string | null;
  role: string;
  groupId: number | null;
  joined: string | null;
  finished: string | null;
  unread: number;
  reflectionNew: boolean;
  dm: DM[];
  reflections: Reflection[];
};

export type GroupNotes = { notes: string; updatedAt: string | null };

export type GroupCard = {
  groupId: number;
  name: string;
  when: string;
  next: string;
  live: boolean;
  liveSoon: boolean;
  durationMinutes: number | null;
  createdAt: string | null;
  description: string | null;
  members: { id: number; name: string; tone: Tone }[];
};

// Whether a group's session is happening now ("live") or hasn't started yet today
// ("live soon"). Derived from the schedule + duration against the current time, so the
// card can show a gentle badge without any extra backend state.
const WEEKDAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export function liveStatus(
  dayOfWeek: string,
  scheduledTime: string,
  durationMinutes: number | null,
  now: Date = new Date(),
): { live: boolean; liveSoon: boolean } {
  const idx = WEEKDAY_INDEX[dayOfWeek.toUpperCase()];
  if (idx === undefined || now.getDay() !== idx) return { live: false, liveSoon: false };
  const [hStr, mStr] = scheduledTime.split(":");
  const start = new Date(now);
  start.setHours(Number(hStr), Number(mStr ?? "0"), 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + (durationMinutes ?? 60));
  if (now >= start && now < end) return { live: true, liveSoon: false };
  if (now < start) return { live: false, liveSoon: true };
  return { live: false, liveSoon: false };
}

// Backend has no avatar palette, so derive a gentle warm/calm split from the id
// (the facilitator always reads as warm with the "you" ring).
export function toneFor(id: number): Tone {
  return id % 2 === 0 ? "calm" : "warm";
}

export function lostLabel(p: { lostCat: GriefCategory | null; lostWords: string | null }): string {
  if (!p.lostCat) return "";
  return p.lostCat === "In their own words" ? p.lostWords || "" : p.lostCat;
}

export function isFacilitator(role: string): boolean {
  return role.toLowerCase() === "facilitator";
}

// ----------------------------------------------------------------- mappers
export function personFromParticipant(p: FacParticipantResponse): Person {
  const grief = griefFor(p.whoLost);
  return {
    id: p.id,
    name: p.displayName,
    tone: toneFor(p.id),
    initials: p.initials,
    pronouns: p.pronouns,
    age: p.age,
    fact: p.fact,
    hobbies: p.hobbies ?? [],
    culture: p.culturalBackground,
    lostCat: grief.cat,
    lostWords: grief.words,
    recency: p.griefRecency,
    role: p.role,
    groupId: p.groupId,
    joined: null,
    finished: p.groupId == null ? `onboarded ${formatTimeSince(p.onboardingTime)}` : null,
    unread: 0,
    reflectionNew: false,
    dm: [],
    reflections: [],
  };
}

// A lighter person built from a member summary (used by the room rail, where only the
// name/tone and the message/reflection payloads are shown).
export function personFromMember(
  m: FacMemberResponse,
  extra: Partial<Person> = {},
): Person {
  return {
    id: m.id,
    name: m.displayName,
    tone: toneFor(m.id),
    initials: m.initials,
    pronouns: m.pronouns,
    age: null,
    fact: "",
    hobbies: [],
    culture: null,
    lostCat: null,
    lostWords: null,
    recency: null,
    role: m.role,
    groupId: null,
    joined: null,
    finished: null,
    unread: 0,
    reflectionNew: false,
    dm: [],
    reflections: [],
    ...extra,
  };
}

export function dmsFrom(messages: FacMessageResponse[], facilitatorId: number): DM[] {
  return [...messages]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((m): DM => ({
      from: m.fromId === facilitatorId ? "you" : "them",
      t: m.body,
      at: formatMessageTime(m.createdAt),
      atIso: m.createdAt,
    }));
}

export function sharedReflections(
  privateNote: string | null,
  facilitatorNote: string | null,
  freeWriting: string | null,
  sharedAt: string | null = null,
): Reflection[] {
  const at = sharedAt ? formatMessageTime(sharedAt) : null;
  const atIso = sharedAt;
  const out: Reflection[] = [];
  if (privateNote) out.push({ q: "How are you feeling now?", a: privateNote, at, atIso });
  if (facilitatorNote) out.push({ q: "What has made you come here today?", a: facilitatorNote, at, atIso });
  if (freeWriting) out.push({ q: "From their free writing", a: freeWriting, at, atIso });
  return out;
}

// Build the home-screen group card from the API group: friendly schedule labels, the
// live / live-soon status, and the (non-facilitator) member avatars. When this week's
// session has already been held, the clock no longer matters — the card points at next
// week's occurrence instead.
export function groupCardFrom(g: FacGroupResponse, sessionClosedForWeek = false): GroupCard {
  const schedule = formatSessionSchedule(
    g.dayOfWeek,
    g.scheduledTime,
    g.scheduledDurationMinutes ?? null,
    sessionClosedForWeek,
  );
  const clock = liveStatus(g.dayOfWeek, g.scheduledTime, g.scheduledDurationMinutes ?? null);
  const live = !sessionClosedForWeek && clock.live;
  const liveSoon = !sessionClosedForWeek && clock.liveSoon;
  return {
    groupId: g.groupId,
    name: g.name,
    when: schedule ? `${schedule.dayLabel}s · ${schedule.timeLabel}` : g.name,
    next: schedule?.relative ?? "",
    live,
    liveSoon,
    durationMinutes: g.scheduledDurationMinutes ?? null,
    createdAt: g.creationTime,
    description: g.description,
    members: g.members
      .filter((m) => !isFacilitator(m.role))
      .map((m) => ({ id: m.id, name: m.displayName, tone: toneFor(m.id) })),
  };
}
