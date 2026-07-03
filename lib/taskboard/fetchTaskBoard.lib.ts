import { throwApiError } from "@/lib/api/apiMessage.lib";
import { UserProjectParamsDTO } from "@/types/taskboard.dto";

export default async function fetchTaskBoard({
  userId,
  projectId,
}: UserProjectParamsDTO) {
  const res = await fetch(
    `/api/taskboard?project_id=${projectId}&user_id=${userId}`,
  );
  if (!res.ok) await throwApiError(res, "Failed to fetch task board");
  return res.json();
}
