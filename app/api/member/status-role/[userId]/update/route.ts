import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { updateMemberStatusRole } from "@/db/projectMember.db";
import { authConfig } from "@/lib/auth/auth";

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

  const data = await updateMemberStatusRole({
    userId,
    roleId: role_id,
    status,
  });

  return Response.json({ success: true, data });
}
