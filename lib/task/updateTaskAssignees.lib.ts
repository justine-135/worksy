import { UpdateTaskAssigneesDTO } from "@/types/task.dto";

export default async function updateTaskAssignees({
  taskId,
  projectId,
  userId,
  assignees,
}: UpdateTaskAssigneesDTO) {
  const response = await fetch(`/api/task/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, userId, assignees }),
  });

  if (!response.ok) {
    throw new Error("Failed to update assignees");
  }

  return response.json();
}
