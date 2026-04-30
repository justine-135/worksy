export default async function fetchRoles({
  projectId,
}: {
  projectId?: string | null;
}) {
  const res = await fetch(`/api/role?project_id=${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}
