import { throwApiError } from "@/lib/api/apiMessage.lib";
import { CommentDTO } from "@/types/activityLog.dto";

export default async function createComment({
  projectId,
  taskId,
  userId,
  type,
  value,
}: CommentDTO) {
  const response = await fetch("/api/activity/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      taskId,
      userId,
      type,
      value,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to comment");

  return response.json();
}
