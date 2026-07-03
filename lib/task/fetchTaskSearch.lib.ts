import { TaskSearchResultDTO } from "@/types/task.dto";

export default async function fetchTaskSearch({
  projectId,
  query,
  excludeId,
}: {
  projectId?: string | null;
  query?: string;
  excludeId?: string | null;
}): Promise<TaskSearchResultDTO[]> {
  const params = new URLSearchParams({ project_id: projectId ?? "" });
  if (query) params.set("query", query);
  if (excludeId) params.set("exclude_id", excludeId);

  const res = await fetch(`/api/task/search?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to search tasks");
  return res.json();
}
