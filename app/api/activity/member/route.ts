import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getMemberActivity } from "@/db/activity.db";
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
  const member_id = searchParams.get("member_id");

  if (!project_id || !member_id) {
    return apiError("Missing required parameters.", 400);
  }

  // Only members of the project may read its activity feed.
  const member = await getProjectMember({
    userId: session.user.id,
    projectId: project_id,
  });

  if (!member) {
    return apiError("You don't have access to this project.", 403);
  }

  const data = await getMemberActivity({
    projectId: project_id,
    memberId: member_id,
  });

  return NextResponse.json(data);
}
