export default async function fetchMemberActivity({
  projectId,
  memberId,
}: {
  projectId: string;
  memberId: string;
}) {
  const res = await fetch(
    `/api/activity/member?project_id=${projectId}&member_id=${memberId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch member activity");
  return res.json();
}
