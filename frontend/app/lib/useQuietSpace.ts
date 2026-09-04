import { useCallback, useEffect, useState } from "react";

import { fetchLatestReflection, saveReflection } from "./api";
import { ReflectionShareSelection } from "./types";

// All of the quiet-space reflection state and persistence, lifted out of the
// chat-room page so it can drive both the in-room quiet tab and the standalone
// /quiet route with identical behaviour.
export function useQuietSpace(apiUrl: string) {
  const [privateNote, setPrivateNote] = useState("");
  const [facilitatorNote, setFacilitatorNote] = useState("");
  const [freeWritingNote, setFreeWritingNote] = useState("");
  const [shareSelection, setShareSelection] = useState<ReflectionShareSelection>(
    {
      guidedAnswers: false,
      freeWriting: false,
    },
  );
  const [isSharingReflection, setIsSharingReflection] = useState(false);
  const [isReflectionShared, setIsReflectionShared] = useState(false);
  const [quietSpaceError, setQuietSpaceError] = useState("");

  const loadReflection = useCallback(async () => {
    try {
      const reflection = await fetchLatestReflection(apiUrl);
      if (reflection) {
        setPrivateNote(reflection.privateNote ?? "");
        setFacilitatorNote(reflection.facilitatorNote ?? "");
        setFreeWritingNote(reflection.freeWriting ?? "");
        setShareSelection({
          guidedAnswers: reflection.sharedGuided,
          freeWriting: reflection.sharedFreeWriting,
        });
        setIsReflectionShared(
          reflection.sharedGuided || reflection.sharedFreeWriting,
        );
      }
    } catch {
      // Gracefully ignore — reflection load is best-effort
    }
  }, [apiUrl]);

  useEffect(() => {
    // Defer so the first reflection load doesn't setState synchronously inside
    // the effect body (matches the chat room's loadRoom pattern).
    const timeoutId = window.setTimeout(() => {
      void loadReflection();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadReflection]);

  // Auto-save unshared reflection text on exit so it is restored next time.
  const persistReflection = useCallback(async () => {
    const trimmedPrivate = privateNote.trim();
    const trimmedFacilitator = facilitatorNote.trim();
    const trimmedFreeWriting = freeWritingNote.trim();
    const hasAnyText = Boolean(
      trimmedPrivate || trimmedFacilitator || trimmedFreeWriting,
    );

    if (!isReflectionShared && hasAnyText) {
      try {
        await saveReflection(apiUrl, {
          privateNote: trimmedPrivate,
          facilitatorNote: trimmedFacilitator,
          freeWriting: trimmedFreeWriting,
          shareGuided: false,
          shareFreeWriting: false,
        });
      } catch {
        // Best-effort — silently ignore save failures on exit
      }
    }

    setQuietSpaceError("");
  }, [
    apiUrl,
    privateNote,
    facilitatorNote,
    freeWritingNote,
    isReflectionShared,
  ]);

  const handlePrivateNoteChange = useCallback((value: string) => {
    setPrivateNote(value);
    setQuietSpaceError("");
    setIsReflectionShared(false);
  }, []);

  const handleFacilitatorNoteChange = useCallback((value: string) => {
    setFacilitatorNote(value);
    setQuietSpaceError("");
    setIsReflectionShared(false);
  }, []);

  const handleFreeWritingNoteChange = useCallback((value: string) => {
    setFreeWritingNote(value);
    setQuietSpaceError("");
    setIsReflectionShared(false);
  }, []);

  const handleShareSelectionChange = useCallback(
    (selection: ReflectionShareSelection) => {
      setShareSelection(selection);
      setQuietSpaceError("");
      setIsReflectionShared(false);
    },
    [],
  );

  const handleShareReflection = useCallback(async () => {
    const trimmedPrivate = privateNote.trim();
    const trimmedFacilitator = facilitatorNote.trim();
    const trimmedFreeWriting = freeWritingNote.trim();
    const hasGuidedText = Boolean(trimmedPrivate || trimmedFacilitator);
    const hasFreeWritingText = Boolean(trimmedFreeWriting);

    if (!shareSelection.guidedAnswers && !shareSelection.freeWriting) {
      setQuietSpaceError("Choose what you would like to share.");
      return;
    }

    if (
      !(shareSelection.guidedAnswers && hasGuidedText) &&
      !(shareSelection.freeWriting && hasFreeWritingText)
    ) {
      setQuietSpaceError("Please type something in the area you selected.");
      return;
    }

    setIsSharingReflection(true);
    setQuietSpaceError("");

    try {
      // One write persists the text and marks the chosen sections as shared.
      // Only treat it as shared once the backend has actually saved it.
      await saveReflection(apiUrl, {
        privateNote: trimmedPrivate,
        facilitatorNote: trimmedFacilitator,
        freeWriting: trimmedFreeWriting,
        shareGuided: shareSelection.guidedAnswers && hasGuidedText,
        shareFreeWriting: shareSelection.freeWriting && hasFreeWritingText,
      });

      setIsReflectionShared(true);
    } catch {
      setQuietSpaceError(
        "We couldn't share this with the facilitator. Please try again.",
      );
    } finally {
      setIsSharingReflection(false);
    }
  }, [apiUrl, privateNote, facilitatorNote, freeWritingNote, shareSelection]);

  return {
    privateNote,
    facilitatorNote,
    freeWritingNote,
    shareSelection,
    isSharingReflection,
    isReflectionShared,
    quietSpaceError,
    loadReflection,
    persistReflection,
    handlePrivateNoteChange,
    handleFacilitatorNoteChange,
    handleFreeWritingNoteChange,
    handleShareSelectionChange,
    handleShareReflection,
  };
}
