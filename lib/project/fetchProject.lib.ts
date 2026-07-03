import { ProjectDetailDTO } from "@/types/project.dto";

export default async function fetchProject(
  projectId: string,
): Promise<ProjectDetailDTO> {
  const res = await fetch(`/api/projects/${projectId}`);

  if (!res.ok) throw new Error("Failed to fetch project");

  const json = await res.json();
  return json.data;
}
