import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import {
  getMemberProjectId,
  updateMemberStatusRole,
} from "@/db/projectMember.db";
import { Permissions } from "@/enum/permissions.enum";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  const body = await req.json();
  const { role_id, status } = body;

  if (!role_id || !status) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // `userId` is the ProjectMember id — resolve its project server-side so the
  // permission check can't be bypassed by a spoofed body.
  const projectId = await getMemberProjectId(userId);

  if (
    !projectId ||
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.MemberEdit,
    ))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await updateMemberStatusRole(
    {
      userId,
      roleId: role_id,
      status,
    },
    session.user.id,
  );

  return Response.json({ success: true, data });
}
