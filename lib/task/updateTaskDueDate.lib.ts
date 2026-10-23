import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UpdateTaskDueDatePayload } from "@/types/task.dto";

export default async function updateTaskDueDate({
  taskId,
  projectId,
  dueDate,
}: UpdateTaskDueDatePayload) {
  const response = await fetch(`/api/task/${taskId}/due-date`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId, dueDate }),
  });

  if (!response.ok) await throwApiError(response, "Failed to update due date");

  return response.json();
}
