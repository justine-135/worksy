import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { updateTaskStatusDB } from "@/db/task.db";
import { Permissions } from "@/enum/permissions.enum";
import { ETaskStatus } from "@/enum/taskStatus.enum";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

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
  const { projectId, userId, status } = body;

  const isValidStatus = Object.values(ETaskStatus).includes(status);

  if (!id || !projectId || !userId || !isValidStatus) {
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

  await updateTaskStatusDB({ projectId, userId, taskId: id, status });

  return Response.json({ success: true });
}
