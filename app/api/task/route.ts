import { updateTaskPositionsDB } from "@/db/task.db";

export async function PATCH(req: Request) {
  const body = await req.json();
  const { projectId, userId, taskId, taskBoardId, orderedTaskIdsByBoard } = body;

  if (
    !projectId ||
    !userId ||
    !taskId ||
    !taskBoardId ||
    !Array.isArray(orderedTaskIdsByBoard) ||
    orderedTaskIdsByBoard.length === 0
  ) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  await updateTaskPositionsDB({
    projectId,
    userId,
    taskId,
    taskBoardId,
    orderedTaskIdsByBoard,
  });

  return Response.json({ success: true });
}
