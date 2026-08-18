import { PopBlock } from "../facilitator/components/Overlays";
import { Participant } from "../lib/types";
import { AvatarCircle, LineIcon } from "./DesignPrimitives";

type ParticipantProfileModalProps = {
  participant: Participant;
  onClose: () => void;
};

// Mirrors the facilitator's full-profile card, minus the grief section — a
// participant only ever sees age, pronouns, background, hobbies and a fact about
// the people in their group.
export function ParticipantProfileModal({
  participant,
  onClose,
}: ParticipantProfileModalProps) {
  const isFacilitator = participant.role === "facilitator";
  const hasBackground =
    participant.culturalBackground != null &&
    participant.culturalBackground.trim() !== "" &&
    participant.culturalBackground !== "—";

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center bg-[rgba(58,52,45,0.18)] px-4 py-24 sm:items-center sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participant-profile-title"
      onClick={onClose}
    >
      <article
        className="sk w-full max-w-md bg-card text-ink shadow-[0_24px_70px_rgba(58,52,45,0.28)] animate-fadeIn"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header — avatar, name (+ facilitator chip), pronouns · age */}
        <div className="flex items-start gap-4 p-5 pb-4 sm:p-6 sm:pb-4">
          <AvatarCircle
            initials={participant.initials}
            tone={isFacilitator ? "calm" : "warm"}
            sizeClass="h-14 w-14 text-lg"
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2
                id="participant-profile-title"
                className="h-title text-[28px] leading-none text-ink"
              >
                {participant.displayName}
              </h2>
              {isFacilitator && (
                <span className="chip text-[13px]">
                  <LineIcon name="people" size={13} /> facilitator
                </span>
              )}
            </div>
            {(participant.pronouns || participant.age) && (
              <p className="mt-1.5 text-[15px] text-muted">
                {[participant.pronouns, participant.age]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition hover:border-ink hover:bg-warm-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm"
            aria-label="Close participant profile"
            onClick={onClose}
          >
            <LineIcon name="close" size={16} />
          </button>
        </div>

        <div className="border-t-2 border-dashed border-line" />

        <div className="space-y-4 p-5 sm:p-6">
          {participant.fact && (
                        <PopBlock icon="spark" label="A fact about them" accent="var(--warm-ink)" skin="v3" tint="var(--warm-soft)">
                          {participant.fact}
                        </PopBlock>
                      )}

          <div className="flex flex-col gap-2">
            <h3 className="leader">Hobbies</h3>
            <div className="flex flex-wrap gap-2">
              {participant.hobbies.length > 0 ? (
                participant.hobbies.map((h, i) => (
                  <span key={i} className="chip calm text-[14.5px]">
                    {h.charAt(0).toUpperCase() + h.slice(1)}
                  </span>
                ))
              ) : (
                <span className="text-[15px] [color:var(--faint)]">
                  none shared
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="leader">Cultural background</h3>
            <p className="text-[15px] leading-6 text-ink">
              {hasBackground ? (
                participant.culturalBackground
              ) : (
                <span className="[color:var(--faint)]">
                  they&apos;d rather not say
                </span>
              )}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
