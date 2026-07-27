import { getServerSession } from "next-auth";

import { getDashboardData } from "@/db/taskboard.db";
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { searchParams } = new URL(req.url);

  const project_id = searchParams.get("project_id");

  if (!project_id) {
    return apiError("Missing project id.", 400);
  }

  const data = await getDashboardData({
    userId: session?.user.id,
    projectId: project_id,
  });

  return Response.json(data);
}
