import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchAssignees({
  projectId,
}: {
  projectId?: string | null;
}) {
  const res = await fetch(`/api/member/assignees?project_id=${projectId}`);
  if (!res.ok) await throwApiError(res, "Failed to fetch members");
  return res.json();
}
