import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UpdateTaskStatusPayload } from "@/types/task.dto";

export default async function updateTaskStatus({
  taskId,
  projectId,
  status,
}: UpdateTaskStatusPayload) {
  const response = await fetch(`/api/task/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, status }),
  });

  if (!response.ok) await throwApiError(response, "Failed to update status");

  return response.json();
}
