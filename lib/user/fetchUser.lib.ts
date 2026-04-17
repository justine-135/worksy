export default async function fetchUser({
  query,
  currentId,
}: {
  query: string;
  currentId?: string | null;
}) {
  const res = await fetch(
    `/api/user/search?query=${query}&current_id=${currentId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}
