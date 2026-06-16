import { updateRole } from "@/db/role.db";
import { authConfig } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
  const { name, permissions, project_id, role_id } = body;

  //   if (!role_id || !status) {
  //     return Response.json({ error: "Invalid payload" }, { status: 400 });
  //   }

  console.log(id, name, permissions, project_id, role_id);

  //   const data = await updateMemberStatusRole({
  //     userId,
  //     roleId: role_id,
  //     status,
  //   });

  const data = await updateRole({
    data: {
      name,
      roleId: role_id,
      permissions,
    },
  });

  return Response.json({
    success: true,
    id,
    name,
    permissions,
    project_id,
    role_id,
    data,
  });
}
