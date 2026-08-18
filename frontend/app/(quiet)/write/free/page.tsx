"use client";

import { useState } from "react";

import { LineIcon } from "../../../components/DesignPrimitives";
import { GroupTabs } from "../../../components/quiet/GroupTabs";
import { QuietSpaceFrame } from "../../../components/quiet/QuietSpaceFrame";
import { FreeWritingField } from "../../../components/quiet/ReflectionFields";
import { SaveDraftButton } from "../../../components/quiet/SaveDraftButton";
import { ShareReflectionDialog } from "../../../components/quiet/ShareReflectionDialog";
import { WRITE_TABS } from "../../../lib/nav";
import { useQuietSpaceContext } from "../../../lib/QuietSpaceContext";

export default function FreeWritingPage() {
  const {
    freeWritingNote,
    shareSelection,
    isSharingReflection,
    isReflectionShared,
    quietSpaceError,
    handleFreeWritingNoteChange,
    handleShareSelectionChange,
    handleShareReflection,
  } = useQuietSpaceContext();

  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const hasFreeWritingText = Boolean(freeWritingNote.trim());

  async function handleShareFromDialog() {
    await handleShareReflection();
    setIsShareDialogOpen(false);
  }

  const shareButton = (
    <div className="relative group w-fit">
      <button
        type="button"
        onClick={() => setIsShareDialogOpen(true)}
        disabled={
          isSharingReflection || !hasFreeWritingText || isReflectionShared
        }
        className="btn calm sm inline-flex items-center gap-2"
      >
        {isReflectionShared && !isSharingReflection && (
          <LineIcon name="check" size={16} />
        )}
        {isSharingReflection
          ? "Sharing…"
          : isReflectionShared
            ? "Shared"
            : "Share with facilitator"}
      </button>
      <span className="absolute top-full mt-2.5 right-0 pointer-events-none opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 p-3 sk thin soft bg-card shadow-[0_8px_24px_rgba(58,52,45,0.12)] w-52 text-xs leading-normal text-muted text-left block">
        Choose which reflection notes to share privately with the facilitator.
      </span>
    </div>
  );

  return (
    <>
      <QuietSpaceFrame
        heading="Free writing"
        description="Write freely and privately. Start wherever you are — there's no wrong way."
        error={quietSpaceError}
        action={
          <div className="flex items-center gap-2">
            <SaveDraftButton />
            {shareButton}
          </div>
        }
      >
        <GroupTabs tabs={WRITE_TABS} ariaLabel="Write" />

        <FreeWritingField
          value={freeWritingNote}
          disabled={isSharingReflection}
          onChange={handleFreeWritingNoteChange}
        />
      </QuietSpaceFrame>

      {isShareDialogOpen && (
        <ShareReflectionDialog
          mode="text"
          selection={shareSelection}
          canSend={shareSelection.freeWriting && hasFreeWritingText}
          disabled={isSharingReflection}
          onSelectionChange={handleShareSelectionChange}
          onCancel={() => setIsShareDialogOpen(false)}
          onSend={handleShareFromDialog}
        />
      )}
    </>
  );
}
