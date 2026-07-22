import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchRoles({
  projectId,
  skip,
  take,
}: {
  projectId?: string | null;
  skip?: number;
  take?: number;
}) {
  const res = await fetch(
    `/api/role?project_id=${projectId}&skip=${skip}&take=${take}`,
  );
  if (!res.ok) await throwApiError(res, "Failed to fetch roles");
  return res.json();
}
