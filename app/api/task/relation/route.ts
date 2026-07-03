import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { updateTaskRelationDB } from "@/db/task.db";
import { Permissions } from "@/enum/permissions.enum";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, userId, parentId, childId, action } = body;

  if (
    !projectId ||
    !userId ||
    !parentId ||
    !childId ||
    (action !== "add" && action !== "remove")
  ) {
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

  try {
    await updateTaskRelationDB({ projectId, userId, parentId, childId, action });
  } catch (error) {
    // Surface cycle-guard / access errors as a 400 so the client toast can show
    // why the link was rejected.
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 400 },
    );
  }

  return Response.json({ success: true });
}
