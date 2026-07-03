import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getProjectActivity } from "@/db/activity.db";
import { getProjectMember } from "@/db/projectMember.db";
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { searchParams } = new URL(req.url);
  const project_id = searchParams.get("project_id");
  const limit = searchParams.get("limit");

  if (!project_id) {
    return apiError("Missing project id.", 400);
  }

  // Only members of the project may read its activity feed.
  const member = await getProjectMember({
    userId: session.user.id,
    projectId: project_id,
  });

  if (!member) {
    return apiError("You don't have access to this project.", 403);
  }

  const data = await getProjectActivity({
    projectId: project_id,
    limit: limit ? Number(limit) : undefined,
  });

  return NextResponse.json(data);
}
