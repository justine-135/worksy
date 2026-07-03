import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function fetchTask(id?: string) {
  const res = await fetch(`/api/task/${id}`);
  if (!res.ok) await throwApiError(res, "Failed to fetch task");
  return res.json();
}
