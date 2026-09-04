// Facilitator API client — mirrors app/lib/api.ts (participant side): resolve the base
// URL from NEXT_PUBLIC_API_URL with a localhost fallback, throw on non-2xx, return JSON.
//
// The facilitator is whoever was chosen on the control panel ("/"), carried in the URL
// as `?fid=<id>`; `facilitatorId` resolves it (falling back to the seeded facilitator).
// The groups list is scoped to that facilitator, so their dashboard only shows their groups.

import type {
  FacGroupResponse,
  FacMessageResponse,
  FacParticipantResponse,
  GroupMessageResponse,
  InboxEntryResponse,
} from "./data";
import { currentFacilitatorId } from "../../lib/identity";

export const fallbackApiUrl = "http://localhost:9000";
export const facilitatorId = currentFacilitatorId();
// Fallback "live group" used only when a room is opened without a specific groupId;
// real navigation always passes the facilitator's own group.
export const liveGroupId = 1;

export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
}

async function getJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(errorMessage);
  return response.json() as Promise<T>;
}

async function send<T>(
  url: string,
  method: "POST" | "PATCH",
  body: unknown,
  errorMessage: string,
): Promise<T> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(errorMessage);
  return response.json() as Promise<T>;
}

// ---- reads ----
// Scoped to the chosen facilitator so the dashboard only shows their own groups.
export function fetchGroups(apiUrl: string): Promise<FacGroupResponse[]> {
  return getJson(
    `${apiUrl}/facilitator/groups?facilitatorId=${facilitatorId}`,
    "Could not load your groups.",
  );
}

export function fetchArrivals(apiUrl: string): Promise<FacParticipantResponse[]> {
  return getJson(`${apiUrl}/facilitator/arrivals`, "Could not load new arrivals.");
}

export function fetchParticipant(
  apiUrl: string,
  participantId: number,
): Promise<FacParticipantResponse> {
  return getJson(
    `${apiUrl}/facilitator/participants/${participantId}`,
    "Could not load this person.",
  );
}

export function fetchInbox(apiUrl: string, groupId: number): Promise<InboxEntryResponse[]> {
  return getJson(
    `${apiUrl}/facilitator/groups/${groupId}/inbox`,
    "Could not load private messages.",
  );
}

export function fetchGroupMessages(
  apiUrl: string,
  groupId: number,
): Promise<GroupMessageResponse[]> {
  return getJson(`${apiUrl}/groups/${groupId}/messages`, "Could not load messages.");
}

export function fetchPrivateThread(
  apiUrl: string,
  groupId: number,
  participantId: number,
): Promise<FacMessageResponse[]> {
  return getJson(
    `${apiUrl}/groups/${groupId}/${participantId}/facilitator-messages`,
    "Could not load this thread.",
  );
}

// Whether the room is open right now and whether this week's session has already been
// held (a closed session stays closed until the next scheduled week). Reuses the
// participant-side endpoint.
export type SessionStateResponse = {
  isSessionNow: boolean;
  sessionClosedForWeek: boolean;
};

export function fetchSessionState(
  apiUrl: string,
  groupId: number,
): Promise<SessionStateResponse> {
  return getJson(
    `${apiUrl}/groups/${groupId}/is-valid`,
    "Could not check the room.",
  );
}

// ---- writes ----
export type GroupInput = {
  name: string;
  dayOfWeek: string; // "FRIDAY"
  scheduledTime: string; // "20:00"
  scheduledDurationMinutes: number; // 15–60, in 5-min steps
  description: string | null;
};

export function createGroup(apiUrl: string, input: GroupInput): Promise<FacGroupResponse> {
  return send(
    `${apiUrl}/facilitator/groups?facilitatorId=${facilitatorId}`,
    "POST",
    input,
    "Could not create the group.",
  );
}

export function updateGroup(
  apiUrl: string,
  groupId: number,
  input: GroupInput,
): Promise<number> {
  return send(
    `${apiUrl}/facilitator/groups/${groupId}`,
    "PATCH",
    input,
    "Could not save the group.",
  );
}

export function placeParticipant(
  apiUrl: string,
  groupId: number,
  participantId: number,
): Promise<number> {
  return send(
    `${apiUrl}/facilitator/groups/${groupId}/participants`,
    "POST",
    { participantId },
    "Could not place this person.",
  );
}

// Entering the room opens the session (sets has_session_now = true); leaving it via "End
// the session" closes it. These are what gate a participant's ability to join — the body
// is ignored by the backend, so we send an empty object. The backend refuses (409) when
// this week's session has already been held; that surfaces as SESSION_CLOSED_FOR_WEEK so
// the room can show its gentle closed state instead of opening.
export const SESSION_CLOSED_FOR_WEEK = "SESSION_CLOSED_FOR_WEEK";

export async function startSession(
  apiUrl: string,
  groupId: number,
): Promise<number> {
  const response = await fetch(`${apiUrl}/groups/${groupId}/start-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({}),
  });
  if (response.status === 409) throw new Error(SESSION_CLOSED_FOR_WEEK);
  if (!response.ok) throw new Error("Could not open the room.");
  return response.json() as Promise<number>;
}

export function endSession(apiUrl: string, groupId: number): Promise<number> {
  return send(
    `${apiUrl}/groups/${groupId}/end-session`,
    "POST",
    {},
    "Could not end the session.",
  );
}

export function sendGroupMessage(
  apiUrl: string,
  groupId: number,
  participantId: number,
  body: string,
): Promise<GroupMessageResponse[]> {
  return send(
    `${apiUrl}/groups/${groupId}/messages`,
    "POST",
    { participantId, body },
    "Could not send the message.",
  );
}

export function sendPrivateMessage(
  apiUrl: string,
  groupId: number,
  fromId: number,
  toId: number,
  body: string,
): Promise<unknown> {
  return send(
    `${apiUrl}/groups/${groupId}/facilitator-messages`,
    "POST",
    { fromId, toId, body },
    "Could not send the message.",
  );
}

export type GroupNotesResponse = { notes: string; updatedAt: string };

export function fetchGroupNotes(
  apiUrl: string,
  groupId: number,
): Promise<GroupNotesResponse> {
  return getJson(
    `${apiUrl}/facilitator/groups/${groupId}/notes`,
    "Could not load group notes.",
  );
}

export function updateGroupNotes(
  apiUrl: string,
  groupId: number,
  notes: string,
): Promise<GroupNotesResponse> {
  return send(
    `${apiUrl}/facilitator/groups/${groupId}/notes`,
    "PATCH",
    { notes },
    "Could not save group notes.",
  );
}

// The facilitator's two reflective prompts for a group: why they put these people
// together, and anything to keep a gentle eye on (safeguarding). Both private to them.
export type NotePrompts = { creationReason: string; safeguardingConcerns: string };

// GET returns an array (the repo returns a Seq); take the first row, default to empty.
export async function fetchNotePrompts(
  apiUrl: string,
  groupId: number,
): Promise<NotePrompts> {
  const rows = await getJson<NotePrompts[]>(
    `${apiUrl}/facilitator/groups/${groupId}/note-prompts`,
    "Could not load group prompts.",
  );
  return rows[0] ?? { creationReason: "", safeguardingConcerns: "" };
}

// The PATCH replaces both columns, so always send the pair together.
export function updateNotePrompts(
  apiUrl: string,
  groupId: number,
  prompts: NotePrompts,
): Promise<unknown> {
  return send(
    `${apiUrl}/facilitator/groups/${groupId}/note-prompts`,
    "PATCH",
    prompts,
    "Could not save group prompts.",
  );
}

export async function deleteGroup(
  apiUrl: string,
  groupId: number,
): Promise<void> {
  const response = await fetch(`${apiUrl}/facilitator/groups/${groupId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Could not delete the group.");
}
