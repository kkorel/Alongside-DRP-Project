"use client";

import { use } from "react";
import { FacilitatorSidebar } from "../../components/FacilitatorSidebar";
import { GroupDetailPage } from "../../components/GroupDetail";

export default function Page({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  return (
    <FacilitatorSidebar>
      <GroupDetailPage groupId={Number(groupId)} />
    </FacilitatorSidebar>
  );
}
