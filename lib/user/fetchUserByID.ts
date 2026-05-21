export default async function fetchUserById({
  userId,
}: {
  userId?: string | null;
}) {
  const res = await fetch(`/api/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}
