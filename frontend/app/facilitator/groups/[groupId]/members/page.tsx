import { GroupRoster } from "../../../components/Roster";

export default async function GroupMembersPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  return <GroupRoster groupId={Number(groupId)} />;
}
