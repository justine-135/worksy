import { throwApiError } from "@/lib/api/apiMessage.lib";
import { CreateCommentPayload } from "@/types/activityLog.dto";

export default async function createComment({
  projectId,
  taskId,
  type,
  value,
}: CreateCommentPayload) {
  const response = await fetch("/api/activity/comment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      taskId,
      type,
      value,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to comment");

  return response.json();
}
