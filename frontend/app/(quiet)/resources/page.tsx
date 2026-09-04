"use client";

import { QuietSpaceFrame } from "../../components/quiet/QuietSpaceFrame";
import { ResourcesPanel } from "../../components/quiet/ResourcesPanel";
import { useQuietSpaceContext } from "../../lib/QuietSpaceContext";

export default function ResourcesPage() {
  const { apiUrl } = useQuietSpaceContext();

  return (
    <QuietSpaceFrame
      heading="Resources"
      description="Helpful links to external support - take a look whenever you're ready."
    >
      <ResourcesPanel apiUrl={apiUrl} />
    </QuietSpaceFrame>
  );
}
