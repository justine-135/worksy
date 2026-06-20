import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { updateRole } from "@/db/role.db";
import { authConfig } from "@/lib/auth/auth";

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

  const data = await updateRole({
    data: {
      name,
      roleId: id,
      permissions,
    },
  });

  return Response.json({
    success: true,
    data,
  });
}
