import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchProjectMembers({
  projectId,
  skip,
  take,
  search,
}: {
  projectId?: string | null;
  skip: number;
  take: number;
  search?: string;
}) {
  const url = new URL("/api/member", window.location.origin);
  url.searchParams.set("project_id", projectId ?? "");
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("take", String(take));
  if (search) url.searchParams.set("search", search);

  const res = await fetch(url.toString());
  if (!res.ok) await throwApiError(res, "Failed to fetch members");
  return res.json();
}
