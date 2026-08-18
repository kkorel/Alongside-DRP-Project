import { RefObject } from "react";

import { Participant, SupportGroup } from "../lib/types";
import { LineIcon } from "./DesignPrimitives";
import { ParticipantPopover } from "./ParticipantPopover";

type ChatHeaderProps = {
  group: SupportGroup | null;
  participants: Participant[];
  isParticipantListOpen: boolean;
  isParticipantListPinned: boolean;
  participantListRef: RefObject<HTMLDivElement | null>;
  onParticipantListHoverChange: (isHovered: boolean) => void;
  onParticipantListPinnedChange: (isPinned: boolean) => void;
  onOpenParticipantProfile: (participant: Participant) => void;
  onExit: () => void;
};

export function ChatHeader({
  group,
  participants,
  isParticipantListOpen,
  isParticipantListPinned,
  participantListRef,
  onParticipantListHoverChange,
  onParticipantListPinnedChange,
  onOpenParticipantProfile,
  onExit,
}: ChatHeaderProps) {
  // The brand mark, "message the facilitator" entry, and the "{facilitator} is
  // holding this space" line all live in the sidebar now, so the room header is
  // just the session identity plus a calm way to leave.
  return (
    <header className="shrink-0 border-b-2 border-dashed border-line bg-card">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div>
            <p className="leader">Today&apos;s room</p>
            <h1 className="h-title text-2xl text-ink sm:text-[28px]">
              {group?.name ?? "Friday Group"}
            </h1>
          </div>

          <ParticipantPopover
            participantCount={participants.length}
            participants={participants}
            isOpen={isParticipantListOpen}
            isPinned={isParticipantListPinned}
            participantListRef={participantListRef}
            onHoverChange={onParticipantListHoverChange}
            onPinnedChange={onParticipantListPinnedChange}
            onOpenParticipantProfile={onOpenParticipantProfile}
          />

          <span className="chip">
            <LineIcon name="clock" size={15} />
            {group?.scheduledDurationMinutes ?? 30} minutes together
          </span>
        </div>

        <div className="relative group w-fit">
          <button type="button" onClick={onExit} className="btn ghost sm">
            Leave the room
          </button>
          <span className="absolute top-full mt-2.5 right-0 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 sk thin soft bg-card shadow-[0_8px_24px_rgba(68,52,35,0.12)] w-52 text-xs leading-normal text-muted text-left block">
            Leave the group session. It is safe to step away at any time.
          </span>
        </div>
      </div>
    </header>
  );
}
