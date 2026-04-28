export default async function fetchProjects({
  userId,
}: {
  userId?: string | null;
}) {
  const res = await fetch(`/api/project?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}
