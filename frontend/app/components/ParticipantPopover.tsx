import { RefObject } from "react";

import { Participant } from "../lib/types";
import { AvatarCircle, LineIcon } from "./DesignPrimitives";

type ParticipantPopoverProps = {
  participantCount: number;
  participants: Participant[];
  isOpen: boolean;
  isPinned: boolean;
  participantListRef: RefObject<HTMLDivElement | null>;
  onHoverChange: (isHovered: boolean) => void;
  onPinnedChange: (isPinned: boolean) => void;
  onOpenParticipantProfile: (participant: Participant) => void;
};

export function ParticipantPopover({
  participantCount,
  participants,
  isOpen,
  isPinned,
  participantListRef,
  onHoverChange,
  onPinnedChange,
  onOpenParticipantProfile,
}: ParticipantPopoverProps) {
  return (
    <div
      ref={participantListRef}
      className="relative"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocus={() => onHoverChange(true)}
    >
      <button
        type="button"
        className="chip cursor-pointer transition hover:border-warm hover:bg-warm-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => onPinnedChange(!isPinned)}
      >
        <LineIcon name="people" size={15} />
        {participantCount || 7} here with you
      </button>

      {isOpen && (
        <div className="sk soft absolute left-0 top-full z-30 mt-2 w-72 bg-card p-2 text-ink shadow-[0_18px_45px_rgba(68,52,35,0.18)]">
          <div className="flex items-start justify-between gap-3 px-3 py-2">
            <div>
              <p className="leader">In the room</p>
              <p className="mt-1 text-sm text-muted">
                Tap on someone&apos;s profile to learn a little about them.
              </p>
            </div>

            {isPinned && (
              <button
                type="button"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:bg-warm-soft hover:text-ink"
                aria-label="Close participant list"
                onClick={() => onPinnedChange(false)}
              >
                <LineIcon name="close" size={14} />
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {participants.map((participant) => (
              <button
                key={participant.id}
                type="button"
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-warm-soft focus:bg-warm-soft focus:outline-none"
                onClick={() => onOpenParticipantProfile(participant)}
              >
                <AvatarCircle
                  initials={participant.initials}
                  tone={participant.role === "facilitator" ? "calm" : "warm"}
                  sizeClass="h-9 w-9 text-xs"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    {participant.displayName}
                  </span>
                  <span className="block text-xs capitalize text-muted">
                    {participant.role}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
