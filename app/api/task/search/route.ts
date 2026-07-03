import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { searchTasksDB } from "@/db/task.db";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("project_id");
  const query = searchParams.get("query");
  const excludeId = searchParams.get("exclude_id");

  if (!projectId) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const data = await searchTasksDB({
    projectId,
    userId: session.user.id,
    query,
    excludeId,
  });

  return Response.json(data);
}
