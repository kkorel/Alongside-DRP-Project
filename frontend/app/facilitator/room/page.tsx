"use client";

import { use } from "react";
import { ChatDrawer } from "../components/Room";
import { liveGroupId } from "../lib/api";

// "Open the room" links here with ?groupId=… so the facilitator opens the specific group's
// room. Falls back to the seeded live group when no id is supplied.
export default function FacilitatorRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string }>;
}) {
  const { groupId } = use(searchParams);
  return <ChatDrawer groupId={Number(groupId) || liveGroupId} />;
}
