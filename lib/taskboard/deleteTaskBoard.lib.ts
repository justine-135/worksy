import { throwApiError } from "@/lib/api/apiMessage.lib";
import { DeleteTaskBoardPayload } from "@/types/taskboard.dto";

export default async function deleteTaskBoard({
  projectId,
  taskBoardId,
  target,
}: DeleteTaskBoardPayload) {
  const response = await fetch("/api/taskboard", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      taskBoardId,
      target,
    }),
  });

  if (!response.ok)
    await throwApiError(response, "Failed to delete task board resource");

  return response.json();
}
