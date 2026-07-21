import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchTaskBoard({
  projectId,
}: {
  projectId?: string | null;
}) {
  const res = await fetch(`/api/taskboard?project_id=${projectId}`);
  if (!res.ok) await throwApiError(res, "Failed to fetch task board");
  return res.json();
}
