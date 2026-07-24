import { throwApiError } from "@/lib/api/apiMessage.lib";
import { CreateProjectInvitePayload } from "@/types/projectInvite.dto";

export default async function createInvite({
  receiverId,
  projectId,
}: CreateProjectInvitePayload) {
  const response = await fetch(`/api/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      project_id: projectId,
      receiver_id: receiverId,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to send invite");

  return response.json();
}
