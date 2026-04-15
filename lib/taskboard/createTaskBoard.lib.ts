import { CreateTaskBoardDTO } from "@/types/taskboard.dto";

export default async function createTaskBoard({
  title,
  projectId,
}: CreateTaskBoardDTO) {
  const response = await fetch("/api/taskboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      projectId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task board");
  }

  return response.json();
}
