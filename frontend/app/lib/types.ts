export type ActiveTab = "group" | "facilitator" | "quiet";

export type ReflectionShareSelection = {
  guidedAnswers: boolean;
  freeWriting: boolean;
};

export type SupportGroup = {
  name: string;
  facilitatorName: string;
  scheduledDurationMinutes: number;
  // Day ("FRIDAY") and time ("17:00") of the scheduled session, straight from
  // the DB. Optional-tolerant so the UI still renders if the backend lags.
  dayOfWeek?: string;
  scheduledTime?: string;
  // Optional "a few words members will see", set by the facilitator.
  description?: string | null;
};

export type Participant = {
  id: number;
  displayName: string;
  pronouns: string | null;
  initials: string;
  age: string | null;
  hobbies: string[];
  fact: string;
  role: string;
  culturalBackground: string | null;
};

export type GroupMessage = {
  id: number;
  body: string;
  createdAt: string;
};

export type SupportLink = {
  id: number;
  title: string;
  url: string;
  description: string | null;
};

export type MeditationPlaylist = {
  title: string;
  description: string | null;
  spotifyUrl: string;
  trackCount: number | null;
};

export type Doodle = {
  id: number;
  imageData: string;
  sharedWithFacilitator: boolean;
  createdAt: string;
};

export type ReflectionResponse = {
  id: number;
  groupId: number;
  participantId: number;
  privateNote: string | null;
  facilitatorNote: string | null;
  freeWriting: string | null;
  sharedGuided: boolean;
  sharedGuidedAt: string | null;
  sharedFreeWriting: boolean;
  sharedFreeWritingAt: string | null;
  createdAt: string;
};

export type OnboardingPayload = {
  callName: string;
  pronouns: string | null;
  age: string | null;
  fact: string;
  hobbies: string[];
  culturalBackground: string | null;
  griefRecency: string | null;
  whoLost: string | null;
};

export type OnboardingResponse = { participantId: number } & OnboardingPayload;
