export default async function fetchProjectActivity({
  projectId,
  limit,
}: {
  projectId: string;
  limit?: number;
}) {
  const res = await fetch(
    `/api/activity?project_id=${projectId}${limit ? `&limit=${limit}` : ""}`,
  );
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
}
