import { throwApiError } from "@/lib/api/apiMessage.lib";
import { CreateProjectInviteDTO } from "@/types/projectInvite.dto";

export default async function createInvite({
  senderId,
  receiverId,
  projectId,
}: CreateProjectInviteDTO) {
  const response = await fetch(`/api/project/invite/${receiverId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_id: senderId,
      project_id: projectId,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to send invite");

  return response.json();
}
