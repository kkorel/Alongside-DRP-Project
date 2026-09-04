import { Suspense } from "react";

import { OnboardingSurvey } from "./OnboardingSurvey";

// OnboardingSurvey reads ?edit= via useSearchParams(), which the App Router requires to
// sit inside a Suspense boundary.
export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingSurvey />
    </Suspense>
  );
}
