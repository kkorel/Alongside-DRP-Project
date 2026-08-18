"use client";

import { useRef, useState } from "react";

import { DoodlePanel, DoodleShareHandle } from "../../components/quiet/DoodlePanel";
import { QuietSpaceFrame } from "../../components/quiet/QuietSpaceFrame";
import { ShareReflectionDialog } from "../../components/quiet/ShareReflectionDialog";
import { useQuietSpaceContext } from "../../lib/QuietSpaceContext";

export default function DoodlePage() {
  const { apiUrl, shareSelection, handleShareSelectionChange } =
    useQuietSpaceContext();
  const doodleShareRef = useRef<DoodleShareHandle | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSharingDoodle, setIsSharingDoodle] = useState(false);

  async function handleShareDoodle() {
    setIsSharingDoodle(true);
    try {
      await doodleShareRef.current?.shareCurrent();
    } finally {
      setIsSharingDoodle(false);
    }
    setIsShareDialogOpen(false);
  }

  const shareButton = (
    <div className="relative group w-fit">
      {/* <button
        type="button"
        onClick={() => setIsShareDialogOpen(true)}
        disabled={isSharingDoodle}
        className="btn calm sm inline-flex items-center gap-2"
      >
        {isSharingDoodle ? "Sharing…" : "Share with facilitator"}
      </button>
      <span className="absolute top-full mt-2.5 right-0 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 sk thin soft bg-card shadow-[0_8px_24px_rgba(58,52,45,0.12)] w-52 text-xs leading-normal text-muted text-left block">
        Share this drawing privately with the facilitator.
      </span> */}
    </div>
  );

  return (
    <>
      <QuietSpaceFrame
        heading="Doodle"
        description="No words needed — just move your hand. There's nothing to get right."
        action={shareButton}
        wide
      >
        <DoodlePanel apiUrl={apiUrl} shareRef={doodleShareRef} />
      </QuietSpaceFrame>

      {isShareDialogOpen && (
        <ShareReflectionDialog
          mode="doodle"
          selection={shareSelection}
          canSend
          disabled={isSharingDoodle}
          onSelectionChange={handleShareSelectionChange}
          onCancel={() => setIsShareDialogOpen(false)}
          onSend={handleShareDoodle}
        />
      )}
    </>
  );
}
