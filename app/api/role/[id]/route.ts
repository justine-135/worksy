import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getRoleProjectId, updateRole } from "@/db/role.db";
import { Permissions } from "@/enum/permissions.enum";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json();
  const { name, permissions } = body;

  if (!name || !id) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  // The role determines its own project — resolve it server-side so the
  // permission check can't be bypassed by a spoofed body.
  const projectId = await getRoleProjectId(id);

  if (
    !projectId ||
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.RolesEdit,
    ))
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await updateRole(
    {
      data: {
        name,
        roleId: id,
        permissions,
      },
    },
    session.user.id,
  );

  return Response.json({
    success: true,
    data,
  });
}
