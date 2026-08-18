import { GroupCreate } from "../../components/Groups";

export default async function NewGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return <GroupCreate returnTo={returnTo} />;
}
