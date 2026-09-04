"use client";

import { GroupTabs } from "../../../components/quiet/GroupTabs";
import { QuietSpaceFrame } from "../../../components/quiet/QuietSpaceFrame";
import { SteadyMePanel } from "../../../components/quiet/SteadyMePanel";
import { CALM_TABS } from "../../../lib/nav";

export default function SteadyPage() {
  return (
    <QuietSpaceFrame
      heading="Notice Things Around You"
      description="A gentle 5-4-3-2-1 grounding exercise to bring you back to the here and now."
    >
      <GroupTabs tabs={CALM_TABS} ariaLabel="Feel calm" />

      <SteadyMePanel />
    </QuietSpaceFrame>
  );
}
