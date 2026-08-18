"use client";

import { useEffect, useMemo, useState } from "react";

import { AvatarCircle, BrandMark, LineIcon } from "./components/DesignPrimitives";
import { fallbackApiUrl } from "./lib/api";
import { fetchPeople, People } from "./lib/people";
import { Participant } from "./lib/types";

// The control panel — the app's front door. There is no auth in this prototype, so
// instead you "become" any participant or facilitator seeded in the database. The
// chosen person is carried onward in the URL (`?pid=` / `?fid=`), and because these
// links are plain anchors the destination loads fresh as that person.
//
// Participant cards offer two ways in: the full onboarding flow, or straight to the
// dashboard. Facilitator cards drop you into their dashboard.

function PersonCard({
  person,
  children,
}: {
  person: Participant;
  children: React.ReactNode;
}) {
  return (
    <li className="sk v2 flex flex-col gap-3 bg-card p-4">
      <div className="flex items-center gap-3">
        <AvatarCircle
          initials={person.initials}
          tone={person.role === "facilitator" ? "calm" : "warm"}
        />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-semibold text-ink">
            {person.displayName}
          </p>
          {person.pronouns && (
            <p className="truncate text-[12.5px] text-muted">{person.pronouns}</p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </li>
  );
}

export default function ControlPanel() {
  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl,
    [],
  );

  const [people, setPeople] = useState<People | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Keep the front door uncluttered: show only a handful of participants. The
  // facilitator list is short, so it stays as-is.
  const PARTICIPANT_LIMIT = 3;

  useEffect(() => {
    let active = true;
    fetchPeople(apiUrl)
      .then((data) => {
        if (active) setPeople(data);
      })
      .catch(() => {
        if (active) setError("We couldn't load the people. Is the server running?");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apiUrl]);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10">
        <header className="flex flex-col items-center text-center">
          <BrandMark />
          <h1 className="h-title mt-1 text-3xl text-ink sm:text-4xl">
            Who would you like to be?
          </h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
            Choose someone to step into their view.
          </p>
        </header>

        {isLoading ? (
          <p className="py-16 text-center text-[15px] text-muted">
            Gathering everyone…
          </p>
        ) : error ? (
          <div
            role="alert"
            className="sk thin soft mx-auto mt-10 max-w-md bg-paper px-4 py-3 text-center text-[15px] text-warm-ink"
          >
            {error}
          </div>
        ) : (
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            {/* Facilitators */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <LineIcon name="people" size={18} className="[color:var(--calm)]" />
                <h2 className="leader [color:var(--calm)]">Facilitators</h2>
              </div>
              {people && people.facilitators.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {people.facilitators.map((person) => (
                    <PersonCard key={person.id} person={person}>
                      <a
                        href={`/facilitator?fid=${person.id}`}
                        className="btn calm sm"
                      >
                        <LineIcon name="arrowLeft" size={15} style={{ transform: "rotate(180deg)" }} />
                        Open facilitator view
                      </a>
                    </PersonCard>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-muted">No facilitators yet.</p>
              )}
            </section>

            {/* Participants */}
            <section>
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <div className="flex items-center gap-2">
                  <LineIcon name="user" size={18} className="[color:var(--warm)]" />
                  <h2 className="leader [color:var(--warm)]">Participants</h2>
                </div>
                {people && people.participants.length > PARTICIPANT_LIMIT && (
                  <p className="text-[12.5px] text-muted">
                    Showing {PARTICIPANT_LIMIT} of {people.participants.length}
                  </p>
                )}
              </div>
              {people && people.participants.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {people.participants.slice(0, PARTICIPANT_LIMIT).map((person) => (
                    <PersonCard key={person.id} person={person}>
                      <a
                        href={`/onboarding/intro?pid=${person.id}`}
                        className="btn warm sm"
                      >
                        Start onboarding
                      </a>
                      <a
                        href={`/dashboard?pid=${person.id}`}
                        className="btn ghost sm"
                      >
                        Open dashboard
                      </a>
                    </PersonCard>
                  ))}
                </ul>
              ) : (
                <p className="text-[14px] text-muted">No participants yet.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
