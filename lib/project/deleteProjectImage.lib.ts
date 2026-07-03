import { throwApiError } from "@/lib/api/apiMessage.lib";

export default async function deleteProjectImage(url: string) {
  const response = await fetch("/api/project/image", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) await throwApiError(response, "Failed to delete uploaded project image");
}
