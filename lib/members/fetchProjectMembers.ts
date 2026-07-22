import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchProjectMembers({
  projectId,
  skip,
  take,
}: {
  projectId?: string | null;
  skip: number;
  take: number;
}) {
  const res = await fetch(
    `/api/member?project_id=${projectId}&skip=${skip}&take=${take}`,
  );
  if (!res.ok) await throwApiError(res, "Failed to fetch members");
  return res.json();
}
