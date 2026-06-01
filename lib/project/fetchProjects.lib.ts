import { TProjectFilter } from "@/types/project.dto";

export default async function fetchProjects({
  userId,
  filter = "all",
}: {
  userId?: string | null;
  filter?: TProjectFilter;
}) {
  const res = await fetch(`/api/project/${userId}?filter=${filter}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}
