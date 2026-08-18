"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { LineIcon } from "../components/DesignPrimitives";
import { ParticipantProfileModal } from "../components/ParticipantProfileModal";
import { SidebarLayout } from "../components/SidebarLayout";
import {
  fallbackApiUrl,
  fetchGroup,
  fetchParticipantGroupId,
  fetchParticipants,
  fetchSessionValid,
  invalidateGroupId,
  participantId,
  SessionState,
} from "../lib/api";
import { withPid } from "../lib/identity";
import { POLL_INTERVAL_MS } from "../lib/pollIntervals";
import { Participant, SupportGroup } from "../lib/types";
import { ThisWeekCard } from "./ThisWeekCard";
import { WeatherCheckIn } from "./WeatherCheckIn";

// Shown when the participant hasn't been added to a group yet — mirrors the
// reassuring "still finding the right people" moment from onboarding, in the
// dashboard's card style. The page polls in the background, so this quietly
// gives way to the real session card once a facilitator adds them.
function FindingGroupCard() {
  return (
    <section className="sk v2 bg-card p-6 text-center sm:p-8">
      <div className="flex justify-center">
        <LineIcon name="people" size={42} className="[color:var(--warm)]" />
      </div>
      <h2 className="h-title mt-3 text-2xl text-ink">
        We&apos;re still finding the right people for you.
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        A good group takes a few of the right people.
      </p>
    </section>
  );
}

// The dashboard bridges onboarding and the chat room: a calm home base with a
// warm greeting, a gentle daily check-in, the upcoming session, and a doorway
// into the quiet space. It only reads from the backend.
export default function DashboardPage() {
  const router = useRouter();
  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  // The participant's group placement: undefined while we're still checking,
  // null when they haven't been added to a group yet, a number once they have.
  const [groupId, setGroupId] = useState<number | null | undefined>(undefined);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Load the placed group's details + who's in it + whether the room is open.
  const loadGroupData = useCallback(async () => {
    const [groupData, participantsData] = await Promise.all([
      fetchGroup(apiUrl),
      fetchParticipants(apiUrl),
    ]);
    setGroup(groupData);
    setParticipants(participantsData);
    // Failures here just keep the last known room state rather than disrupting the page.
    fetchSessionValid(apiUrl).then(setSessionState).catch(() => {});
  }, [apiUrl]);

  useEffect(() => {
    let active = true;

    // Defer so we don't setState synchronously inside the effect body (matches
    // the chat room's loadRoom pattern).
    const timeoutId = window.setTimeout(() => {
      setIsLoading(true);
      setErrorMessage("");

      (async () => {
        try {
          // Tell "no group" apart from the fallback group — only load a room if placed.
          const id = await fetchParticipantGroupId(apiUrl);
          if (!active) return;
          setGroupId(id);
          if (id !== null) await loadGroupData();
        } catch {
          if (active)
            setErrorMessage("We couldn't load your space. Please try again.");
        } finally {
          if (active) setIsLoading(false);
        }
      })();
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [apiUrl, loadGroupData]);

  // Gentle 5s poll. While unplaced, watch for the facilitator adding us so the page
  // updates without a refresh; once placed, keep the "step into the room" gate fresh.
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (groupId === null) {
        fetchParticipantGroupId(apiUrl)
          .then((id) => {
            if (id === null) return;
            invalidateGroupId(); // drop the cached fallback now that we're placed
            setGroupId(id);
            loadGroupData().catch(() => {});
          })
          .catch(() => {});
      } else if (typeof groupId === "number") {
        // Re-check placement, not just the room gate: if the facilitator closed or
        // removed the group, fall back to the unplaced view without a manual refresh.
        fetchParticipantGroupId(apiUrl)
          .then((id) => {
            if (id === groupId) {
              fetchSessionValid(apiUrl).then(setSessionState).catch(() => {});
              return;
            }
            // Placement changed: dropped from the group, or moved to another one.
            invalidateGroupId();
            setGroupId(id);
            if (id === null) {
              setGroup(null);
              setParticipants([]);
              setSessionState(null);
            } else {
              loadGroupData().catch(() => {});
            }
          })
          .catch(() => {});
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [apiUrl, groupId, loadGroupData]);

  // Close the profile modal on Escape, matching the chat room.
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedParticipant(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const self = participants.find((p) => p.id === participantId);
  const firstName = self?.displayName?.split(" ")[0] ?? "";

  return (
    <SidebarLayout>
      <main className="flex h-full min-h-0 flex-col overflow-hidden bg-paper text-ink">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 sm:px-10 lg:px-16">
        {/* Pinned to the pane's right edge — the screen's top-right. A soft
            beige pill that reopens the onboarding/profile flow; secondary to
            the warm "Step into the room" CTA. */}
        <div className="mb-6 flex justify-end">
          <Link
            href={withPid("/onboarding?edit=1")}
            className="btn sm [border-color:var(--line)] [color:var(--warm-ink)]"
          >
            <LineIcon name="user" size={15} />
            <span className="max-[420px]:sr-only">Update profile</span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            {isLoading ? (
              <p className="py-12 text-center text-[15px] text-muted">
                Setting up your space…
              </p>
            ) : errorMessage ? (
              <div
                role="alert"
                className="sk thin soft bg-paper px-4 py-3 text-center text-[15px] text-warm-ink"
              >
                {errorMessage}
              </div>
            ) : (
              <>
                {/* Greeting */}
                <div>
                  <p className="leader [color:var(--warm)]">Welcome back</p>
                  <h1 className="h-title mt-1 text-3xl text-ink sm:text-4xl">
                    {firstName
                      ? `It's good to have you here, ${firstName}.`
                      : "It's good to have you here."}
                  </h1>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">
                    This is your calm corner. Take a breath, see how you&apos;re
                    doing, prepare for your meeting, or step into the quiet space - there&apos;s no
                    rush.
                  </p>
                </div>

                <WeatherCheckIn />

                {groupId === null ? (
                  <FindingGroupCard />
                ) : (
                  <ThisWeekCard
                    group={group}
                    participants={participants}
                    isSessionValid={sessionState?.isSessionNow ?? null}
                    sessionClosedForWeek={
                      sessionState?.sessionClosedForWeek ?? false
                    }
                    onOpenProfile={setSelectedParticipant}
                    onEnterRoom={() => router.push(withPid("/room"))}
                  />
                )}
              </>
            )}
        </div>
      </div>

      {selectedParticipant && (
        <ParticipantProfileModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
      </main>
    </SidebarLayout>
  );
}
