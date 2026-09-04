import { Participant } from "./types";

// The control-panel roster: everyone in the database, split by role. Lives apart
// from lib/api.ts so the control panel doesn't pull in the participant-scoped client
// (whose identity is resolved from the URL, which has none on the control panel).
export type People = {
  participants: Participant[];
  facilitators: Participant[];
};

export async function fetchPeople(apiUrl: string): Promise<People> {
  const response = await fetch(`${apiUrl}/people`);
  if (!response.ok) {
    throw new Error("Could not load the people.");
  }
  return (await response.json()) as People;
}
