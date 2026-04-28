export default async function fetchProjectMembers({
  projectId,
}: {
  projectId?: string | null;
}) {
  const res = await fetch(
    `/api/member/project/members?project_id=${projectId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
}
