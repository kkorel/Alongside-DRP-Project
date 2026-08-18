"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { BrandMark } from "../components/DesignPrimitives";
import { QuietReflectionRoom } from "../components/QuietReflectionRoom";
import { fallbackApiUrl } from "../lib/api";
import { withPid } from "../lib/identity";
import { useQuietSpace } from "../lib/useQuietSpace";

// Standalone quiet space, reachable from the dashboard. It reuses the exact same
// QuietReflectionRoom and reflection logic as the in-room quiet tab; only the
// framing and the "back" destination (the dashboard) differ.
export default function QuietPage() {
  const router = useRouter();
  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const quiet = useQuietSpace(apiUrl);

  async function handleExit() {
    // A `return` query param lets callers (e.g. onboarding) send the visitor
    // back to exactly where they left off; otherwise fall back to the dashboard.
    await quiet.persistReflection();
    const returnTo = new URLSearchParams(window.location.search).get("return");
    const destination =
      returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard";
    router.push(withPid(destination));
  }

  return (
    <main className="h-screen overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
      <section className="panel mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
        <header className="shrink-0 border-b-2 border-dashed border-line bg-card p-4 sm:p-5">
          <BrandMark />
        </header>

        <QuietReflectionRoom
          apiUrl={apiUrl}
          privateNote={quiet.privateNote}
          facilitatorNote={quiet.facilitatorNote}
          freeWritingNote={quiet.freeWritingNote}
          shareSelection={quiet.shareSelection}
          isSharingReflection={quiet.isSharingReflection}
          isReflectionShared={quiet.isReflectionShared}
          quietSpaceError={quiet.quietSpaceError}
          onPrivateNoteChange={quiet.handlePrivateNoteChange}
          onFacilitatorNoteChange={quiet.handleFacilitatorNoteChange}
          onFreeWritingNoteChange={quiet.handleFreeWritingNoteChange}
          onShareSelectionChange={quiet.handleShareSelectionChange}
          onExitQuietSpace={handleExit}
          onShareReflection={quiet.handleShareReflection}
          backLabel="Back to your space"
        />
      </section>
    </main>
  );
}
