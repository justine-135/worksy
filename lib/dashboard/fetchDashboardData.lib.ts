import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchDashboardData({
  projectId,
}: {
  projectId?: string | null;
}) {
  const res = await fetch(`/api/taskboard/dashboard?project_id=${projectId}`);
  if (!res.ok) await throwApiError(res, "Failed to fetch dashboard data");
  return res.json();
}
