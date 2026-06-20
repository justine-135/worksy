import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import {
  createTaskBoard,
  getTaskBoard,
  updateTaskBoardOrdersDB,
} from "@/db/taskboard.db";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const user_id = searchParams.get("user_id");
  const project_id = searchParams.get("project_id");

  if (!user_id || !project_id) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const data = await getTaskBoard({ userId: user_id, projectId: project_id });

  return Response.json(data);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, userId, orderedTaskBoardIds } = body;

  if (
    !projectId ||
    !userId ||
    !Array.isArray(orderedTaskBoardIds) ||
    orderedTaskBoardIds.length === 0
  ) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  await updateTaskBoardOrdersDB({
    projectId,
    userId,
    orderedTaskBoardIds,
  });

  return Response.json({ success: true });
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, title } = body;

  if (!projectId || !title) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  await createTaskBoard({
    projectId,
    title,
  });

  return Response.json({ success: true });
}
