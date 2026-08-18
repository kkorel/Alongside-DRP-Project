import { Suspense } from "react";

import { FacilitatorSidebar } from "../components/FacilitatorSidebar";
import { Centered, MessagesView } from "../components/Messages";

// MessagesView reads ?groupId= via useSearchParams(), which the App Router requires to sit
// inside a Suspense boundary.
export default function MessagesPage() {
  return (
    <FacilitatorSidebar>
      <Suspense fallback={<Centered>Loading your messages…</Centered>}>
        <MessagesView />
      </Suspense>
    </FacilitatorSidebar>
  );
}
