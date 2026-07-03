import { throwApiError } from "@/lib/api/apiMessage.lib";
import { DeleteTaskBoardDTO } from "@/types/taskboard.dto";

export default async function deleteTaskBoard({
  projectId,
  userId,
  taskBoardId,
  target,
}: DeleteTaskBoardDTO) {
  const response = await fetch("/api/taskboard", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      userId,
      taskBoardId,
      target,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to delete task board resource");

  return response.json();
}
