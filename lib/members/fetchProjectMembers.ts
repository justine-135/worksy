import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchProjectMembers({
  projectId,
  skip,
  take,
  search,
  roleId,
  status,
}: {
  projectId?: string | null;
  skip: number;
  take: number;
  search?: string;
  roleId?: string;
  status?: string;
}) {
  const url = new URL("/api/member", window.location.origin);
  url.searchParams.set("project_id", projectId ?? "");
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("take", String(take));
  if (search) url.searchParams.set("search", search);
  if (roleId) url.searchParams.set("role_id", roleId);
  if (status) url.searchParams.set("status", status);

  const res = await fetch(url.toString());
  if (!res.ok) await throwApiError(res, "Failed to fetch members");
  return res.json();
}
