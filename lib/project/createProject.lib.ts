import { CreateProjectDTO } from "@/types/project.dto";

export default async function createProject({
  title,
  description,
  ownerId,
  imageUrl,
}: CreateProjectDTO) {
  const response = await fetch("/api/project", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      ownerId,
      imageUrl,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create project");
  }

  return response.json();
}
