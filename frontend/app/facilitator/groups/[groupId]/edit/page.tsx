import { GroupEdit } from "../../../components/Groups";

export default async function EditGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  return <GroupEdit groupId={Number(groupId)} />;
}
