export default async function fetchInvites({
  receiverId,
}: {
  receiverId?: string | null;
}) {
  const res = await fetch(`/api/project/invite/${receiverId}`);
  if (!res.ok) throw new Error("Failed to fetch invites");
  return res.json();
}
