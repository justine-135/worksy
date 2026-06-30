import { UpdateTaskStatusDTO } from "@/types/task.dto";

export default async function updateTaskStatus({
  taskId,
  projectId,
  userId,
  status,
}: UpdateTaskStatusDTO) {
  const response = await fetch(`/api/task/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, userId, status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update status");
  }

  return response.json();
}
