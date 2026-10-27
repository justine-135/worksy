import { throwApiError } from "@/lib/api/apiMessage.lib";

export type BoardFilter = {
  title?: string;
  assigneeId?: string;
  priority?: string;
  status?: string;
};

export default async function fetchTaskBoard({
  projectId,
  filter,
}: {
  projectId?: string | null;
  filter?: BoardFilter;
}) {
  const params = new URLSearchParams();
  if (projectId) params.set("project_id", projectId);
  if (filter?.title) params.set("filter_title", filter.title);
  if (filter?.assigneeId) params.set("filter_assignee_id", filter.assigneeId);
  if (filter?.priority) params.set("filter_priority", filter.priority);
  if (filter?.status) params.set("filter_status", filter.status);

  const res = await fetch(`/api/taskboard?${params.toString()}`);
  if (!res.ok) await throwApiError(res, "Failed to fetch task board");
  return res.json();
}
