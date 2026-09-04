"use client";

import { AvatarCircle, LineIcon } from "../components/DesignPrimitives";
import { formatSessionSchedule, liveStatus } from "../lib/format";
import { participantId } from "../lib/api";
import { Participant, SupportGroup } from "../lib/types";

type ThisWeekCardProps = {
  group: SupportGroup | null;
  participants: Participant[];
  // Whether the facilitator has opened the room right now (backend session flag). null
  // while we're still checking. This — not the clock — gates stepping in.
  isSessionValid: boolean | null;
  // Whether this week's session has already been held — once the facilitator
  // closes the room it stays closed until the next scheduled week, so every
  // time-related label points at next week.
  sessionClosedForWeek: boolean;
  onOpenProfile: (participant: Participant) => void;
  onEnterRoom: () => void;
};

// A group's "live" / "live soon" badge, mirroring the facilitator's CircleBadge. "live"
// means the facilitator has opened the room; "live soon" means it's around the scheduled
// time but they haven't opened it yet.
function SessionBadge({
  isSessionValid,
  live,
  liveSoon,
}: {
  isSessionValid: boolean | null;
  live: boolean;
  liveSoon: boolean;
}) {
  if (isSessionValid) {
    return (
      <span className="chip warm text-[12.5px]">
        <span
          className="dot warm"
          style={{ width: 7, height: 7, animation: "pulse 1.6s infinite" }}
        />{" "}
        live
      </span>
    );
  }
  if (live || liveSoon) {
    return (
      <span
        className="chip text-[12.5px]"
        style={{ borderColor: "var(--warm)", color: "var(--warm-ink)" }}
      >
        <span className="dot warm" style={{ width: 7, height: 7 }} /> live soon
      </span>
    );
  }
  return null;
}

// A single avatar that lifts and reveals its name on hover, and opens the full
// profile on click — shared by the facilitator face and the member row.
function HoverAvatar({
  participant,
  onOpenProfile,
  size = "h-10 w-10 text-sm",
  overlap = false,
}: {
  participant: Participant;
  onOpenProfile: (participant: Participant) => void;
  size?: string;
  overlap?: boolean;
}) {
  const isFacilitator = participant.role === "facilitator";
  // Single-letter initial, matching the design's overlapping faces.
  const initial = participant.displayName.charAt(0).toUpperCase();

  return (
    <div
      className="relative w-fit"
      style={overlap ? { marginLeft: -9 } : undefined}
    >
      <button
        type="button"
        onClick={() => onOpenProfile(participant)}
        className="peer rounded-full transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm"
        aria-label={`Open ${participant.displayName}'s profile`}
      >
        <AvatarCircle
          initials={initial}
          tone={isFacilitator ? "calm" : "warm"}
          sizeClass={size}
        />
      </button>
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 scale-95 peer-hover:opacity-100 peer-hover:scale-100 transition-all duration-200 ease-out z-50 px-3 py-2 sk thin soft bg-card shadow-[0_8px_24px_rgba(68,52,35,0.12)] whitespace-nowrap text-xs leading-normal text-muted text-center block">
        <span className="font-semibold text-ink">{participant.displayName}</span>
        {isFacilitator ? " · facilitator" : ""}
      </span>
    </div>
  );
}

// The upcoming-session card. Shows the group, its (DB-derived) date and time,
// and the people in it — each avatar is hoverable for a name and clickable for
// the full About me / Fun fact profile, mirroring the chat room.
export function ThisWeekCard({
  group,
  participants,
  isSessionValid,
  sessionClosedForWeek,
  onOpenProfile,
  onEnterRoom,
}: ThisWeekCardProps) {
  const schedule = formatSessionSchedule(
    group?.dayOfWeek,
    group?.scheduledTime,
    group?.scheduledDurationMinutes,
    sessionClosedForWeek,
  );
  const facilitator = participants.find((p) => p.role === "facilitator");
  const members = participants.filter((p) => p.role !== "facilitator");
  // "Others" who'll be there — the members excluding the current participant.
  const others = members.filter((p) => p.id !== participantId);
  // Schedule-derived status drives only the badge/label; joinability is isSessionValid.
  // Once this week's session has been held, the clock no longer matters.
  const clockStatus = liveStatus(
    group?.dayOfWeek,
    group?.scheduledTime,
    group?.scheduledDurationMinutes,
  );
  const live = !sessionClosedForWeek && clockStatus.live;
  const liveSoon = !sessionClosedForWeek && clockStatus.liveSoon;
  const facilitatorFirstName =
    facilitator?.displayName?.split(" ")[0] ?? "the facilitator";

  return (
    <section className="sk v2 bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <p className="leader [color:var(--warm)]">
              {sessionClosedForWeek ? "Next week" : "This week"}
              {schedule?.dateLabel ? ` · ${schedule.dayLabel} ${schedule.dateLabel}` : ""}
            </p>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2.5">
            <h2 className="h-title text-2xl text-ink">
              {group?.name ?? "Your group"}
            </h2>
            <SessionBadge
              isSessionValid={isSessionValid && !sessionClosedForWeek}
              live={live}
              liveSoon={liveSoon}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[15px] text-muted">
            <span className="flex items-center gap-2">
            {schedule?.timeLabel && (
              <>
                <LineIcon name="clock" size={16} className="[color:var(--muted)]" />
                {schedule.dayLabel}s · {schedule.timeLabel} · 
                {group?.scheduledDurationMinutes != null && (
                  <span className="text-muted text-[15px]">
                     {group.scheduledDurationMinutes} min
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-muted text-[15px]">
                  · <LineIcon name="people" size={15} /> {members.length}
                </span>
                </>
            )}
            {facilitator && (
              <>
                · held by{" "}
                <HoverAvatar
                  participant={facilitator}
                  onOpenProfile={onOpenProfile}
                  size="h-7 w-7 text-xs"
                />
                <span className="text-ink">{facilitator.displayName}</span>
              </>
            )}
            </span>
          </div>
        </div>

        {isSessionValid && !sessionClosedForWeek ? (
          <button
            type="button"
            onClick={onEnterRoom}
            className="btn warm inline-flex shrink-0 items-center gap-2"
          >
            <LineIcon name="people" size={16} />
            Step into the room
          </button>
        ) : (
          // The room isn't open yet — mirror the facilitator's dashed "next session" slot.
          // A passed scheduled time without an open room means the facilitator hasn't
          // started yet, so we say the room opens soon rather than letting anyone in. Kept
          // compact and non-wrapping (shrink-0) so it stays pinned top-right like the
          // active button.
          <div
            className="btn ghost inline-flex shrink-0 items-center gap-2 whitespace-nowrap"
            style={{ borderStyle: "dashed", cursor: "default", opacity: 0.85 }}
            title={
              live || liveSoon
                ? `${facilitatorFirstName} hasn't opened the room yet`
                : undefined
            }
          >
            <LineIcon name="clock" size={15} className="[color:var(--muted)]" />
            {live || liveSoon
              ? "The room opens soon"
              : schedule?.relative
                ? `Next session ${schedule.relative}`
                : "Next session soon"}
          </div>
        )}
      </div>

      <p className="mt-3 text-[15.5px] leading-relaxed text-ink">
        {group?.description?.trim()
          ? group.description
          : ""}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 border-t-2 border-dashed border-line pt-4">
        {members.length > 0 ? (
          <>
            <div className="flex items-center pl-[9px]">
              {members.map((participant) => (
                <HoverAvatar
                  key={participant.id}
                  participant={participant}
                  onOpenProfile={onOpenProfile}
                  size="h-10 w-10 text-sm"
                  overlap
                />
              ))}
            </div>
            <div className="text-[14.5px] text-muted">
              <span className="text-ink">
                {others.length > 0
                  ? `${others.length} ${others.length === 1 ? "other" : "others"}`
                  : "Your group"}
              </span>{" "}
              will be there
              <div className="text-[12.5px] text-faint">
                hover a face to see who&apos;s coming
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            {/* TODO: add more context to this */}
            We&apos;ll introduce you to the group soon.
          </p>
        )}
      </div>
    </section>
  );
}
