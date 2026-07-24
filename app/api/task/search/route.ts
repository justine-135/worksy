import { getServerSession } from "next-auth";

import { searchTasksDB } from "@/db/task.db";
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("project_id");
  const query = searchParams.get("query");
  const excludeId = searchParams.get("exclude_id");

  if (!projectId) {
    return apiError("Missing project id.", 400);
  }

  try {
    const data = await searchTasksDB({
      projectId,
      userId: session.user.id,
      query,
      excludeId,
    });

    return Response.json(data);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Internal server error",
      400,
    );
  }
}
