import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getProjectActivity } from "@/db/activity.db";
import { getProjectMember } from "@/db/projectMember.db";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const project_id = searchParams.get("project_id");
  const limit = searchParams.get("limit");

  if (!project_id) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  // Only members of the project may read its activity feed.
  const member = await getProjectMember({
    userId: session.user.id,
    projectId: project_id,
  });

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await getProjectActivity({
    projectId: project_id,
    limit: limit ? Number(limit) : undefined,
  });

  return NextResponse.json(data);
}
