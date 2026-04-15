import { CreateProjectDTO } from "@/types/project.dto";

export default async function createProject({
  title,
  description,
  ownerId,
}: CreateProjectDTO) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      ownerId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save task board order");
  }

  return response.json();
}
