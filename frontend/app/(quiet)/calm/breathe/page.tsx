"use client";

import { BreathePanel } from "../../../components/quiet/BreathePanel";
import { GroupTabs } from "../../../components/quiet/GroupTabs";
import { QuietSpaceFrame } from "../../../components/quiet/QuietSpaceFrame";
import { CALM_TABS } from "../../../lib/nav";

export default function BreathePage() {
  return (
    <QuietSpaceFrame
      heading="Slow Your Breathing"
      description="Follow the circle if it helps. There's no rush - let your breath find its own pace."
    >
      <GroupTabs tabs={CALM_TABS} ariaLabel="Feel calm" />

      <BreathePanel />
    </QuietSpaceFrame>
  );
}
