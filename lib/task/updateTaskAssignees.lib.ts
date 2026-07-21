import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UpdateTaskAssigneesPayload } from "@/types/task.dto";

export default async function updateTaskAssignees({
  taskId,
  projectId,
  assignees,
}: UpdateTaskAssigneesPayload) {
  const response = await fetch(`/api/task/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, assignees }),
  });

  if (!response.ok) await throwApiError(response, "Failed to update assignees");

  return response.json();
}
