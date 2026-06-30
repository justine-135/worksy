import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { createRole, getRoles } from "@/db/role.db";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return Response.json({ error: "Invalid project id" }, { status: 400 });
  }

  const data = await getRoles({ projectId });

  return Response.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, name, permissions } = body;

  if (!projectId || !name || !permissions) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = await createRole({ name, permissions, projectId }, session.user.id);

  return Response.json({
    success: true,
    data,
  });
}
