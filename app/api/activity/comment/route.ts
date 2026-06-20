import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { createComment } from "@/db/activity.db";
import { authConfig } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { projectId, taskId, userId, type, value } = body;

  if (!projectId || !taskId || !userId || !value) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  console.log(projectId, taskId, userId, type, value);

  const data = await createComment({ projectId, taskId, userId, type, value });

  return Response.json({
    success: true,
    data,
  });
}
