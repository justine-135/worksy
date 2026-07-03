import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UserProjectParamsDTO } from "@/types/taskboard.dto";

interface Params extends UserProjectParamsDTO {
  taskId: string;
  taskBoardId: string;
  orderedTaskIdsByBoard: Array<{
    taskBoardId: string;
    taskIds: string[];
  }>;
}

export default async function saveTaskPosition({
  taskId,
  taskBoardId,
  orderedTaskIdsByBoard,
  projectId,
  userId,
}: Params) {
  const response = await fetch("/api/task", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      userId,
      taskId,
      taskBoardId,
      orderedTaskIdsByBoard,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to save task position");

  return response.json();
}
