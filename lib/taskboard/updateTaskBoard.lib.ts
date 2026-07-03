import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UpdateTaskBoardDTO } from "@/types/taskboard.dto";

export default async function updateTaskBoard({
  projectId,
  userId,
  taskBoardId,
  title,
  status,
}: UpdateTaskBoardDTO) {
  const response = await fetch("/api/taskboard", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      userId,
      taskBoardId,
      title,
      status,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to update task board");

  return response.json();
}
