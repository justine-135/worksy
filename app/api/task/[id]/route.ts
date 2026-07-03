import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import {
  getTaskDetail,
  getTaskProjectId,
  updateTaskAssigneesDB,
} from "@/db/task.db";
import { Permissions } from "@/enum/permissions.enum";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  if (!id) {
    return Response.json({ error: "Missing id" }, { status: 400 });
  }

  // Viewing task details requires task.view in the task's project.
  const projectId = await getTaskProjectId(id);

  if (
    !projectId ||
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.TaskView,
    ))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await getTaskDetail(id);

  return Response.json(data);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { projectId, userId, assignees } = body;

  if (!id || !projectId || !userId || !Array.isArray(assignees)) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.TaskEdit,
    ))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await updateTaskAssigneesDB({ projectId, userId, taskId: id, assignees });

  return Response.json({ success: true });
}
