import { ProjectDetailDTO, UpdateProjectSettingsDTO } from "@/types/project.dto";

export default async function updateProjectSettings({
  projectId,
  data,
}: {
  projectId: string;
  data: UpdateProjectSettingsDTO;
}): Promise<ProjectDetailDTO> {
  const res = await fetch(`/api/projects/${projectId}/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    throw new Error(json?.error?.toString() ?? "Failed to update project");
  }

  const json = await res.json();
  return json.data;
}
