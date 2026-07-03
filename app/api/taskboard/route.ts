import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import {
  createTaskBoard,
  deleteAllTasksInBoardDB,
  deleteTaskBoardDB,
  getTaskBoard,
  updateTaskBoardDB,
  updateTaskBoardOrdersDB,
} from "@/db/taskboard.db";
import { Permissions } from "@/enum/permissions.enum";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const user_id = searchParams.get("user_id");
  const project_id = searchParams.get("project_id");

  if (!user_id || !project_id) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const data = await getTaskBoard({ userId: user_id, projectId: project_id });

  return Response.json(data);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, userId, orderedTaskBoardIds } = body;

  if (
    !projectId ||
    !userId ||
    !Array.isArray(orderedTaskBoardIds) ||
    orderedTaskBoardIds.length === 0
  ) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.BoardEdit,
    ))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await updateTaskBoardOrdersDB({
    projectId,
    userId,
    orderedTaskBoardIds,
  });

  return Response.json({ success: true });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, userId, taskBoardId, title, status } = body;

  if (!projectId || !userId || !taskBoardId || !title || !status) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.BoardEdit,
    ))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await updateTaskBoardDB({
    projectId,
    userId,
    taskBoardId,
    title,
    status,
  });

  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, userId, taskBoardId, target } = body;

  if (
    !projectId ||
    !userId ||
    !taskBoardId ||
    (target !== "board" && target !== "tasks")
  ) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Deleting the column needs board.delete; only emptying it (removing its
  // tasks) needs task.delete.
  const requiredPermission =
    target === "board" ? Permissions.BoardDelete : Permissions.TaskDelete;

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      requiredPermission,
    ))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // `target` selects the scope: drop the whole column, or just empty it.
  if (target === "board") {
    await deleteTaskBoardDB({ projectId, userId, taskBoardId });
  } else {
    await deleteAllTasksInBoardDB({ projectId, userId, taskBoardId });
  }

  return Response.json({ success: true });
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, title } = body;

  if (!projectId || !title) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.BoardCreate,
    ))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await createTaskBoard({
    projectId,
    title,
  });

  return Response.json({ success: true });
}
