import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchMemberActivity({
  projectId,
  memberId,
}: {
  projectId: string;
  memberId: string;
}) {
  const res = await fetch(
    `/api/activity/member?project_id=${projectId}&member_id=${memberId}`,
  );
  if (!res.ok) await throwApiError(res, "Failed to fetch member activity");
  return res.json();
}
