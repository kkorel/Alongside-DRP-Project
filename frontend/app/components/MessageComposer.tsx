import { FormEvent } from "react";

import { LineIcon } from "./DesignPrimitives";

type MessageComposerProps = {
  activeTab: "group" | "facilitator";
  facilitatorName: string;
  messageBody: string;
  isSending: boolean;
  isLoading: boolean;
  errorMessage: string;
  onMessageBodyChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
};

export function MessageComposer({
  activeTab,
  facilitatorName,
  messageBody,
  isSending,
  isLoading,
  errorMessage,
  onMessageBodyChange,
  onSendMessage,
}: MessageComposerProps) {
  const isFacilitatorTab = activeTab === "facilitator";

  return (
    <footer className="shrink-0 border-t-2 border-dashed border-line bg-card px-4 py-4 sm:px-5">
      <form
        onSubmit={onSendMessage}
        className="mx-auto flex max-w-4xl items-center gap-3"
      >
        <label className="sr-only" htmlFor="message">
          Message
        </label>
        <input
          id="message"
          className={`field min-h-12 flex-1 !rounded-full px-5 ${isFacilitatorTab ? "calm" : ""}`}
          placeholder={
            isFacilitatorTab
              ? `Write a private message to ${facilitatorName}…`
              : "Share something with the group…"
          }
          value={messageBody}
          onChange={(event) => onMessageBodyChange(event.target.value)}
          disabled={isSending || isLoading}
        />
        <button
          type="submit"
          disabled={isSending || isLoading}
          className={`btn ${isFacilitatorTab ? "calm" : "warm"} inline-flex h-12 min-w-12 items-center justify-center gap-2 !rounded-full px-5`}
          aria-label="Send message"
        >
          <LineIcon name="send" size={18} />
          <span className="hidden sm:inline">
            {isSending ? "Sending…" : "Send"}
          </span>
        </button>
      </form>

      {errorMessage && (
        <p
          role="alert"
          className="mx-auto mt-3 flex max-w-4xl items-center gap-2 text-sm text-warm-ink"
        >
          <LineIcon name="heart" size={14} />
          {errorMessage}
        </p>
      )}
    </footer>
  );
}
