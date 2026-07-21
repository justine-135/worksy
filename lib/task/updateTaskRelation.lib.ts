import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UpdateTaskRelationPayload } from "@/types/task.dto";

export default async function updateTaskRelation({
  projectId,
  parentId,
  childId,
  action,
}: UpdateTaskRelationPayload) {
  const response = await fetch(`/api/task/relation`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, parentId, childId, action }),
  });

  if (!response.ok)
    await throwApiError(response, "Failed to update relationship");

  return response.json();
}
