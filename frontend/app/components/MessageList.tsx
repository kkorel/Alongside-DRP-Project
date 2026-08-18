import { RefObject } from "react";

import { participantId } from "../lib/api";
import {
  dayLabelFor,
  formatMessageTime,
  initialsFor,
  isNewDay,
} from "../lib/format";
import { ActiveTab, GroupMessage, Participant } from "../lib/types";
import { AvatarCircle } from "./DesignPrimitives";
import { FacilitatorMessageModal } from "./FacilitatorMessageModal";

// A small centred day marker ("Today", "Yesterday", "6 June") shown once per
// day, so conversations that span weeks stay easy to follow.
function DateSeparator({ iso }: { iso: string }) {
  const label = dayLabelFor(iso);
  if (!label) return null;
  return (
    <div className="flex justify-center" aria-hidden="true">
      <span className="chip px-3 py-0.5 text-[12px] text-faint">{label}</span>
    </div>
  );
}

type MessageListProps = {
  activeTab: Exclude<ActiveTab, "quiet">;
  facilitatorName: string;
  messages: GroupMessage[];
  facilitatorMessages: GroupMessage[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  findParticipantById: (id: number) => Participant | undefined;
  onOpenParticipantProfile: (participant: Participant) => void;
};

export function MessageList({
  activeTab,
  facilitatorName,
  messages,
  facilitatorMessages,
  isLoading,
  messagesEndRef,
  findParticipantById,
  onOpenParticipantProfile,
}: MessageListProps) {
  const visibleMessages = activeTab === "group" ? messages : facilitatorMessages;

  return (
    <section className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-2 text-muted">
          <span className="scrawl text-xl text-faint">settling in…</span>
          <span className="text-sm">Loading the group</span>
        </div>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          {activeTab === "facilitator" && (
            <FacilitatorMessageModal facilitatorName={facilitatorName} />
          )}

          {visibleMessages.length === 0 ? (
            <div className="sk thin soft dash bg-paper p-6 text-center text-[15px] leading-relaxed text-muted">
              {activeTab === "group"
                ? "No messages yet. You can start chatting when you feel ready."
                : `No private messages yet. You can write to ${facilitatorName} here when you are ready.`}
            </div>
          ) : (
            visibleMessages.map((message, index) => {
              const participant = findParticipantById(message.id);
              const displayName = participant?.displayName ?? "Unknown";
              const isFacilitator = participant?.role === "facilitator";
              const isOwn = message.id === participantId;

              const showDate = isNewDay(
                visibleMessages[index - 1]?.createdAt,
                message.createdAt,
              );

              return (
                <div
                  key={`${message.id}-${message.createdAt}-${index}`}
                  className="flex flex-col gap-5"
                >
                {showDate && <DateSeparator iso={message.createdAt} />}
                <article
                  className={`flex gap-3 sm:gap-4 ${isOwn ? "flex-row-reverse" : ""}`}
                >
                  <button
                    type="button"
                    className="rounded-full transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm disabled:cursor-default disabled:hover:opacity-100"
                    aria-label={`Open ${displayName}'s profile`}
                    disabled={!participant}
                    onClick={() => {
                      if (participant) {
                        onOpenParticipantProfile(participant);
                      }
                    }}
                  >
                    <AvatarCircle
                      initials={participant?.initials ?? initialsFor(displayName)}
                      tone={isFacilitator ? "calm" : "warm"}
                      sizeClass="h-10 w-10 text-sm"
                    />
                  </button>

                  <div
                    className={`flex min-w-0 flex-1 flex-col ${isOwn ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 ${isOwn ? "justify-end" : ""}`}
                    >
                      <button
                        type="button"
                        className="text-sm font-semibold text-ink transition hover:text-warm-ink focus:outline-none focus:underline disabled:cursor-default disabled:hover:text-ink"
                        disabled={!participant}
                        onClick={() => {
                          if (participant) {
                            onOpenParticipantProfile(participant);
                          }
                        }}
                      >
                        {displayName}
                      </button>
                      {isFacilitator && (
                        <span className="chip calm px-2 py-0 text-[11px]">
                          facilitator
                        </span>
                      )}
                      <time className="text-xs text-faint">
                        {formatMessageTime(message.createdAt)}
                      </time>
                    </div>

                    <div
                      className={`bubble w-fit max-w-full text-[15px] leading-6 text-ink sm:text-base ${isFacilitator ? "calm" : ""} ${isOwn ? "mine" : ""}`}
                    >
                      {message.body}
                    </div>
                  </div>
                </article>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>
      )}
    </section>
  );
}
