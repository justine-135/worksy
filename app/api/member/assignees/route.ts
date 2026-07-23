import { getServerSession } from "next-auth";

import { getAssignees } from "@/db/projectMember.db";
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return apiError("Missing project id.", 400);
  }

  const data = await getAssignees(projectId);

  return Response.json(data);
}
