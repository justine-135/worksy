import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UpdateTaskRelationDTO } from "@/types/task.dto";

export default async function updateTaskRelation({
  projectId,
  userId,
  parentId,
  childId,
  action,
}: UpdateTaskRelationDTO) {
  const response = await fetch(`/api/task/relation`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, userId, parentId, childId, action }),
  });

  if (!response.ok) await throwApiError(response, "Failed to update relationship");

  return response.json();
}
