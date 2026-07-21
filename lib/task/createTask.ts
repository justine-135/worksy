import { throwApiError } from "@/lib/api/apiMessage.lib";
import { CreateTaskPayload } from "@/types/task.dto";

export default async function createTask({
  title,
  description,
  priority,
  taskBoardId,
  assignees,
  projectId,
  parentId,
}: CreateTaskPayload) {
  const response = await fetch("/api/task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      priority,
      task_board_id: taskBoardId,
      assignees,
      project_id: projectId,
      parent_id: parentId ?? null,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to create task");

  return response.json();
}
