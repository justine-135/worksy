export default async function inviteMember({ inviteId }: { inviteId: string }) {
  const response = await fetch("/api/member/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invite_id: inviteId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to invite member");
  }

  return response.json();
}
