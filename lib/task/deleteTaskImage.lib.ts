export default async function deleteTaskImage(url: string) {
  const response = await fetch("/api/task/image", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Failed to delete uploaded task image");
  }
}
