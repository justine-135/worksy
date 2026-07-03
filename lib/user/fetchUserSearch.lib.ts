import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchUserSearch({
  query,
  currentId,
}: {
  query: string;
  currentId?: string | null;
}) {
  const res = await fetch(
    `/api/user/search?query=${query}&current_id=${currentId}`,
  );
  if (!res.ok) await throwApiError(res, "Failed to fetch user");
  return res.json();
}
