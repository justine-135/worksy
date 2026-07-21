import { throwApiError } from "@/lib/api/apiMessage.lib";
import { CreateProjectPayload } from "@/types/project.dto";

export default async function createProject({
  title,
  description,
  imageUrl,
}: CreateProjectPayload) {
  const response = await fetch("/api/project", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      description,
      image_url: imageUrl,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to create project");

  return response.json();
}
