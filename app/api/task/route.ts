import { createTaskDB, updateTaskPositionsDB } from "@/db/task.db";
import { authConfig } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, userId, taskId, taskBoardId, orderedTaskIdsByBoard } =
    body;

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

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    assignees,
    description,
    task_board_id,
    priority,
    project_id,
    user_id,
  } = body;

  if (!title || !task_board_id || !project_id || !user_id) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = await createTaskDB({
    title,
    assignees,
    description,
    taskBoardId: task_board_id,
    priority,
    projectId: project_id,
    userId: user_id,
  });

  return Response.json({ success: true, data });
}
