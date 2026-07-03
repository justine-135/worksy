import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchProjectActivity({
  projectId,
  limit,
}: {
  projectId: string;
  limit?: number;
}) {
  const res = await fetch(
    `/api/activity?project_id=${projectId}${limit ? `&limit=${limit}` : ""}`,
  );
  if (!res.ok) await throwApiError(res, "Failed to fetch activity");
  return res.json();
}
