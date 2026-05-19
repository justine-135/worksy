export default async function deleteProjectImage(url: string) {
  const response = await fetch("/api/project/image", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete uploaded project image");
  }
}
