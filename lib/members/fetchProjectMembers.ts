import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchProjectMembers({
  projectId,
}: {
  projectId?: string | null;
}) {
  const res = await fetch(
    `/api/member/project/members?project_id=${projectId}`,
  );
  if (!res.ok) await throwApiError(res, "Failed to fetch members");
  return res.json();
}
