import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UpdateTaskBoardPayload } from "@/types/taskboard.dto";

export default async function updateTaskBoard({
  projectId,
  taskBoardId,
  title,
  status,
}: UpdateTaskBoardPayload) {
  const response = await fetch("/api/taskboard", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      taskBoardId,
      title,
      status,
    }),
  });

  if (!response.ok)
    await throwApiError(response, "Failed to update task board");

  return response.json();
}
