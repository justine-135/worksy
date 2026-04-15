import { TaskBoardParamsDTO } from "@/types/taskboard.dto";

export default async function fetchTaskBoard({
  userId,
  projectId,
}: TaskBoardParamsDTO) {
  const res = await fetch(
    `/api/taskboard?project_id=${projectId}&user_id=${userId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}
