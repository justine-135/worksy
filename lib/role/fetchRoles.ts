import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchRoles({
  projectId,
}: {
  projectId?: string | null;
}) {
  const res = await fetch(`/api/role?project_id=${projectId}`);
  if (!res.ok) await throwApiError(res, "Failed to fetch roles");
  return res.json();
}
