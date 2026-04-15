export default async function fetchProjects({ userId }: { userId: string }) {
  const res = await fetch(`/api/project?user_id=${userId}`);
  if (!res.ok) throw new Error("Failed to fetch projcets");
  return res.json();
}
