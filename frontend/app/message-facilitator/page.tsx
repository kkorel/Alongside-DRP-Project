"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { MessageComposer } from "../components/MessageComposer";
import { MessageList } from "../components/MessageList";
import { ParticipantProfileModal } from "../components/ParticipantProfileModal";
import { MessageOrigin, SidebarLayout } from "../components/SidebarLayout";
import {
  fallbackApiUrl,
  fetchFacilitatorMessages,
  fetchGroup,
  fetchParticipants,
  sendMessage,
} from "../lib/api";
import { POLL_INTERVAL_MS } from "../lib/pollIntervals";
import { GroupMessage, Participant, SupportGroup } from "../lib/types";

// A private, one-to-one conversation with the facilitator. It lives inside the
// sidebar shell: only this window changes when "Message {facilitator}" is
// pressed, while the sidebar keeps the options from wherever the visitor came.

export default function FacilitatorMessagePage() {
  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [facilitatorMessages, setFacilitatorMessages] = useState<GroupMessage[]>(
    [],
  );
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [messageBody, setMessageBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Which sidebar to keep showing, based on where the visitor opened this from.
  const [messageOrigin, setMessageOrigin] = useState<MessageOrigin>("room");

  const facilitatorName = group?.facilitatorName ?? "Sean";

  const loadMessages = useCallback(async () => {
    setFacilitatorMessages(await fetchFacilitatorMessages(apiUrl));
  }, [apiUrl]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const [groupData, participantsData] = await Promise.all([
        fetchGroup(apiUrl),
        fetchParticipants(apiUrl),
      ]);
      setGroup(groupData);
      setParticipants(participantsData);
      await loadMessages();
    } catch {
      setErrorMessage("We couldn't load your conversation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, loadMessages]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [facilitatorMessages]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadMessages().catch(() => {});
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [loadMessages]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedParticipant(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  // Read the origin (?from=room|quiet|dashboard) so the sidebar matches the
  // place the visitor stepped away from. Defaults to the room.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const from = new URLSearchParams(window.location.search).get("from");
      if (from === "room" || from === "quiet" || from === "dashboard") {
        setMessageOrigin(from);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function findParticipantById(id: number) {
    if (id === undefined || id === null) return undefined;
    return participants.find((p) => p.id === id);
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = messageBody.trim();
    if (!trimmedMessage) {
      setErrorMessage("Please type a message before sending.");
      return;
    }

    const facilitatorId = participants.find(
      (participant) => participant.role === "facilitator",
    )?.id;
    if (facilitatorId === undefined) {
      setErrorMessage("Your message could not be sent. Please try again.");
      return;
    }

    setIsSending(true);
    setErrorMessage("");
    try {
      await sendMessage(apiUrl, "facilitator-messages", trimmedMessage, facilitatorId);
      setMessageBody("");
      await loadMessages();
    } catch {
      setErrorMessage("Your message could not be sent. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <SidebarLayout messageOrigin={messageOrigin}>
      <main className="h-full overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
        <section className="panel mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
          <header className="flex shrink-0 items-center gap-3 border-b-2 border-dashed border-line bg-card p-4 sm:p-5">
            <span className="av calm h-10 w-10" aria-hidden="true">
              {facilitatorName.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="leader">Private conversation</p>
              <h1 className="h-title text-2xl text-ink sm:text-[26px]">
                {facilitatorName}
              </h1>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col bg-card">
            <MessageList
              activeTab="facilitator"
              facilitatorName={facilitatorName}
              messages={[]}
              facilitatorMessages={facilitatorMessages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              findParticipantById={findParticipantById}
              onOpenParticipantProfile={setSelectedParticipant}
            />

            {selectedParticipant && (
              <ParticipantProfileModal
                participant={selectedParticipant}
                onClose={() => setSelectedParticipant(null)}
              />
            )}

            <MessageComposer
              activeTab="facilitator"
              facilitatorName={facilitatorName}
              messageBody={messageBody}
              isSending={isSending}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onMessageBodyChange={setMessageBody}
              onSendMessage={handleSendMessage}
            />
          </div>
        </section>
      </main>
    </SidebarLayout>
  );
}
