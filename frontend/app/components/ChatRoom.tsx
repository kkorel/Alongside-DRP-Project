import { FormEvent, RefObject } from "react";

import { GroupMessage, Participant, SupportGroup } from "../lib/types";
import { ChatHeader } from "./ChatHeader";
import { MessageComposer } from "./MessageComposer";
import { MessageList } from "./MessageList";
import { ParticipantProfileModal } from "./ParticipantProfileModal";

type ChatRoomProps = {
  group: SupportGroup | null;
  participants: Participant[];
  messages: GroupMessage[];
  isLoading: boolean;
  isSending: boolean;
  errorMessage: string;
  messageBody: string;
  selectedParticipant: Participant | null;
  isParticipantListOpen: boolean;
  isParticipantListPinned: boolean;
  participantListRef: RefObject<HTMLDivElement | null>;
  messagesEndRef: RefObject<HTMLDivElement | null>;
  findParticipantById: (id: number) => Participant | undefined;
  onParticipantListHoverChange: (isHovered: boolean) => void;
  onParticipantListPinnedChange: (isPinned: boolean) => void;
  onOpenParticipantProfile: (participant: Participant) => void;
  onCloseParticipantProfile: () => void;
  onExit: () => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  onMessageBodyChange: (value: string) => void;
};

export function ChatRoom({
  group,
  participants,
  messages,
  isLoading,
  isSending,
  errorMessage,
  messageBody,
  selectedParticipant,
  isParticipantListOpen,
  isParticipantListPinned,
  participantListRef,
  messagesEndRef,
  findParticipantById,
  onParticipantListHoverChange,
  onParticipantListPinnedChange,
  onOpenParticipantProfile,
  onCloseParticipantProfile,
  onExit,
  onSendMessage,
  onMessageBodyChange,
}: ChatRoomProps) {
  const facilitatorName = group?.facilitatorName ?? "Sean";

  // The quiet space and private facilitator messaging now live in the sidebar
  // (as their own routes), so the room is purely the group conversation.
  return (
    <main className="h-full overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
      <section className="panel mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
        <ChatHeader
          group={group}
          participants={participants}
          isParticipantListOpen={isParticipantListOpen}
          isParticipantListPinned={isParticipantListPinned}
          participantListRef={participantListRef}
          onParticipantListHoverChange={onParticipantListHoverChange}
          onParticipantListPinnedChange={onParticipantListPinnedChange}
          onOpenParticipantProfile={onOpenParticipantProfile}
          onExit={onExit}
        />

        <div className="flex min-h-0 flex-1 flex-col bg-card">
          <MessageList
            activeTab="group"
            facilitatorName={facilitatorName}
            messages={messages}
            facilitatorMessages={[]}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            findParticipantById={findParticipantById}
            onOpenParticipantProfile={onOpenParticipantProfile}
          />

          {selectedParticipant && (
            <ParticipantProfileModal
              participant={selectedParticipant}
              onClose={onCloseParticipantProfile}
            />
          )}

          <MessageComposer
            activeTab="group"
            facilitatorName={facilitatorName}
            messageBody={messageBody}
            isSending={isSending}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onMessageBodyChange={onMessageBodyChange}
            onSendMessage={onSendMessage}
          />
        </div>
      </section>
    </main>
  );
}
