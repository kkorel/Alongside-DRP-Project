"use client";

import { useState } from "react";

import { LineIcon } from "../DesignPrimitives";
import { useQuietSpaceContext } from "../../lib/QuietSpaceContext";

// An explicit "Save" for reflection drafts. It persists the current writing
// (private, facilitator, and free-writing notes) privately — without sharing —
// so it survives leaving the quiet space, hopping to message the facilitator,
// or refreshing. Reuses the same draft persistence the standalone /quiet page
// runs on exit.
export function SaveDraftButton() {
  const {
    privateNote,
    facilitatorNote,
    freeWritingNote,
    isSharingReflection,
    persistReflection,
  } = useQuietSpaceContext();

  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const hasAnyText = Boolean(
    privateNote.trim() || facilitatorNote.trim() || freeWritingNote.trim(),
  );

  async function handleSave() {
    setIsSaving(true);
    await persistReflection();
    setIsSaving(false);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={isSaving || isSharingReflection || !hasAnyText}
      className="btn ghost sm inline-flex items-center gap-2"
    >
      {justSaved && !isSaving && <LineIcon name="check" size={16} />}
      {isSaving ? "Saving…" : justSaved ? "Saved" : "Save"}
    </button>
  );
}
