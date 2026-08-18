import {
  GroupMessage,
  OnboardingPayload,
  OnboardingResponse,
  Doodle,
  MeditationPlaylist,
  Participant,
  ReflectionResponse,
  SupportGroup,
  SupportLink,
} from "./types";
import { currentParticipantId } from "./identity";

// Fallback group used only if we can't resolve the participant's real group below.
export const groupId = 1;
// Who's using the participant app — resolved from the `?pid=` chosen on the control
// panel (falls back to the seeded participant). Read once at module load; the control
// panel enters with a full page load, so this reflects the chosen person.
export const participantId = currentParticipantId();
export const fallbackApiUrl = "http://localhost:9000";

// Resolve the participant's group from their (currently hardcoded) participantId, so the
// group id isn't separately hardcoded. The facilitator participant endpoint is the only
// one that exposes a person's placement; the lookup is cached for the session and falls
// back to the seeded group if it isn't available.
let groupIdPromise: Promise<number> | null = null;

export function resolveGroupId(apiUrl: string): Promise<number> {
  if (!groupIdPromise) {
    groupIdPromise = (async () => {
      try {
        const response = await fetch(
          `${apiUrl}/facilitator/participants/${participantId}`,
        );
        if (!response.ok) return groupId;
        const data = (await response.json()) as { groupId: number | null };
        return typeof data.groupId === "number" ? data.groupId : groupId;
      } catch {
        return groupId;
      }
    })();
  }
  return groupIdPromise;
}

// Drop the cached group lookup so the next resolveGroupId re-fetches. Used by the
// dashboard once a previously-unplaced participant gets added to a group, so the
// cached fallback (groupId = 1) doesn't stick.
export function invalidateGroupId() {
  groupIdPromise = null;
}

// The participant's real group placement, with no fallback and no caching — returns
// null when they haven't been added to a group yet. The dashboard uses this (rather
// than resolveGroupId) to tell "no group" apart from "group 1", and polls it so the
// page updates the moment a facilitator adds them.
export async function fetchParticipantGroupId(
  apiUrl: string,
): Promise<number | null> {
  const response = await fetch(
    `${apiUrl}/facilitator/participants/${participantId}`,
  );
  if (!response.ok) {
    throw new Error("Could not check your group placement.");
  }
  const data = (await response.json()) as { groupId: number | null };
  return typeof data.groupId === "number" ? data.groupId : null;
}

function sortMessages(messages: GroupMessage[]) {
  return [...messages].sort(
    (first, second) =>
      new Date(first.createdAt).getTime() -
        new Date(second.createdAt).getTime() || first.id - second.id,
  );
}

export async function fetchGroup(apiUrl: string): Promise<SupportGroup> {
  const response = await fetch(`${apiUrl}/groups/${await resolveGroupId(apiUrl)}`);

  if (!response.ok) {
    throw new Error("Could not load the group.");
  }

  return response.json();
}

export async function fetchParticipants(apiUrl: string): Promise<Participant[]> {
  const response = await fetch(`${apiUrl}/groups/${await resolveGroupId(apiUrl)}/participants`);

  if (!response.ok) {
    throw new Error("Could not load the group.");
  }

  return response.json();
}

// Whether the facilitator has opened the room right now, and whether this week's
// session has already been held (closed sessions stay closed until the next
// scheduled week). The flag — not the clock — is what decides if a participant
// may step in: the session is only joinable once the facilitator has entered
// (start-session), and everyone is removed when they leave (end-session).
export type SessionState = {
  isSessionNow: boolean;
  sessionClosedForWeek: boolean;
};

export async function fetchSessionValid(apiUrl: string): Promise<SessionState> {
  const response = await fetch(`${apiUrl}/groups/${await resolveGroupId(apiUrl)}/is-valid`);

  if (!response.ok) {
    throw new Error("Could not check whether the room is open.");
  }

  return (await response.json()) as SessionState;
}

export async function fetchGroupMessages(apiUrl: string): Promise<GroupMessage[]> {
  const response = await fetch(`${apiUrl}/groups/${await resolveGroupId(apiUrl)}/messages`);

  if (!response.ok) {
    throw new Error("Could not load messages.");
  }

  return sortMessages(await response.json());
}

type FacilitatorMessageResponse = {
  fromId: number;
  toId: number;
  body: string;
  createdAt: string;
};

export async function fetchFacilitatorMessages(
  apiUrl: string,
): Promise<GroupMessage[]> {
  const response = await fetch(
    `${apiUrl}/groups/${await resolveGroupId(apiUrl)}/${participantId}/facilitator-messages`,
  );

  if (!response.ok) {
    throw new Error("Could not load private messages.");
  }

  // The facilitator endpoint returns { fromId, toId, body, createdAt }; map the
  // sender (fromId) onto `id` so it matches the shape MessageList expects.
  const messages = (await response.json()) as FacilitatorMessageResponse[];
  return sortMessages(
    messages.map(({ fromId, body, createdAt }) => ({
      id: fromId,
      body,
      createdAt,
    })),
  );
}

export async function sendMessage(
  apiUrl: string,
  endpoint: "messages" | "facilitator-messages",
  body: string,
  facilitatorId?: number,
) {
  // The backend expects { participantId, body } for the group chat and
  // { fromId, toId, body } for a private message to the facilitator.
  const payload =
    endpoint === "messages"
      ? { participantId, body }
      : { fromId: participantId, toId: facilitatorId, body };

  const response = await fetch(`${apiUrl}/groups/${await resolveGroupId(apiUrl)}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Could not send message.");
  }
}

export type ReflectionInput = {
  privateNote: string;
  facilitatorNote: string;
  freeWriting: string;
  shareGuided: boolean;
  shareFreeWriting: boolean;
};

/* Upserts the current participant's reflection. The backend stores every
   section and marks guided / free writing as shared independently, so this
   resolves only when the write actually persisted. */
export async function saveReflection(
  apiUrl: string,
  reflection: ReflectionInput,
): Promise<ReflectionResponse> {
  const response = await fetch(`${apiUrl}/groups/${await resolveGroupId(apiUrl)}/reflections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      participantId,
      privateNote: reflection.privateNote || null,
      facilitatorNote: reflection.facilitatorNote || null,
      freeWriting: reflection.freeWriting || null,
      shareGuided: reflection.shareGuided,
      shareFreeWriting: reflection.shareFreeWriting,
    }),
  });

  if (!response.ok) {
    throw new Error(
      "We couldn't save your reflection. Please check your connection and try again.",
    );
  }

  return response.json();
}

// A kept weather check-in: the chosen sky ("clear skies", "overcast", …) as the
// backend stores it, an optional private note, and when it was kept. The GET
// returns these oldest-first.
export type Icebreaker = {
  choice: string;
  description: string | null;
  time: string;
};

export async function saveIcebreaker(
  apiUrl: string,
  choice: string,
  description: string | null,
): Promise<void> {
  const response = await fetch(
    `${apiUrl}/participants/${participantId}/icebreakers`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ choice, description }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "We couldn't keep that thought just now. Please check your connection and try again.",
    );
  }
}

export async function fetchIcebreakers(apiUrl: string): Promise<Icebreaker[]> {
  const response = await fetch(
    `${apiUrl}/participants/${participantId}/icebreakers`,
  );

  if (!response.ok) {
    throw new Error("Could not load your kept thoughts.");
  }

  return (await response.json()) as Icebreaker[];
}

export async function fetchOnboarding(
  apiUrl: string,
): Promise<OnboardingResponse | null> {
  const response = await fetch(
    `${apiUrl}/participants/${participantId}/onboarding`,
  );

  if (!response.ok) {
    throw new Error("Could not load your saved answers.");
  }

  // Backend returns the saved object or JSON null (no prior survey answers).
  return response.json();
}

export async function saveOnboarding(
  apiUrl: string,
  payload: OnboardingPayload,
  // True only when finishing the full onboarding flow (not a profile edit from the
  // dashboard), which is what refreshes the participant's onboarding time.
  completed = false,
): Promise<OnboardingResponse> {
  const response = await fetch(
    `${apiUrl}/participants/${participantId}/onboarding${
      completed ? "?completed=true" : ""
    }`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(
      "We couldn't save your answers just now. Please check your connection and try again.",
    );
  }

  return response.json();
}

export async function fetchSupportLinks(
  apiUrl: string,
): Promise<SupportLink[]> {
  const response = await fetch(`${apiUrl}/groups/${await resolveGroupId(apiUrl)}/support-links`);

  if (!response.ok) {
    throw new Error("Could not load resources.");
  }

  return (await response.json()) as SupportLink[];
}

export async function fetchMeditationPlaylists(
  apiUrl: string,
): Promise<MeditationPlaylist[]> {
  const response = await fetch(
    `${apiUrl}/groups/${await resolveGroupId(apiUrl)}/meditation-playlists`,
  );

  if (!response.ok) {
    throw new Error("Could not load playlists.");
  }

  return (await response.json()) as MeditationPlaylist[];
}

export async function saveDoodle(
  apiUrl: string,
  imageData: string,
  shareWithFacilitator: boolean,
): Promise<Doodle> {
  const response = await fetch(`${apiUrl}/groups/${await resolveGroupId(apiUrl)}/doodles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      participantId,
      imageData,
      sharedWithFacilitator: shareWithFacilitator,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not keep your doodle.");
  }

  return response.json();
}

export async function fetchDoodles(apiUrl: string): Promise<Doodle[]> {
  const response = await fetch(
    `${apiUrl}/groups/${await resolveGroupId(apiUrl)}/participants/${participantId}/doodles`,
  );

  if (!response.ok) {
    throw new Error("Could not load your doodles.");
  }

  return (await response.json()) as Doodle[];
}

export async function fetchLatestReflection(
  apiUrl: string,
): Promise<ReflectionResponse | null> {
  try {
    const response = await fetch(
      `${apiUrl}/groups/${await resolveGroupId(apiUrl)}/participants/${participantId}/reflection`,
    );

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as ReflectionResponse | null;
  } catch {
    return null;
  }
}
