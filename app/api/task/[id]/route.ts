import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getTaskDetail, updateTaskAssigneesDB } from "@/db/task.db";
import { authConfig } from "@/lib/auth/auth";

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

  await updateTaskAssigneesDB({ projectId, userId, taskId: id, assignees });

  return Response.json({ success: true });
}
