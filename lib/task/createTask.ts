import { CreateTaskDTO } from "@/types/task.dto";

export default async function createTask({
  title,
  description,
  priority,
  taskBoardId,
  assignees,
  projectId,
}: CreateTaskDTO) {
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
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
}
