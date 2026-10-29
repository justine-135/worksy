import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchRoles({
  projectId,
  skip,
  take,
  search,
  permission,
}: {
  projectId?: string | null;
  skip?: number;
  take?: number;
  search?: string;
  permission?: string;
}) {
  const url = new URL("/api/role", window.location.origin);
  url.searchParams.set("project_id", projectId ?? "");
  if (skip !== undefined) url.searchParams.set("skip", String(skip));
  if (take !== undefined) url.searchParams.set("take", String(take));
  if (search) url.searchParams.set("search", search);
  if (permission) url.searchParams.set("permission", permission);

  const res = await fetch(url.toString());
  if (!res.ok) await throwApiError(res, "Failed to fetch roles");
  return res.json();
}
