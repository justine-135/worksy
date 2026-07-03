import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { checkPermissionDB } from "@/db/permission.db"; // Safe to import here! (Server environment)
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return apiError("Missing project id.", 400);
  }

  const permissions = await checkPermissionDB(projectId, session.user.id);

  return NextResponse.json({ permissions });
}
