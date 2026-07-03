import { getServerSession } from "next-auth";

import { createComment } from "@/db/activity.db";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const { projectId, taskId, userId, type, value } = body;

  if (!projectId || !taskId || !userId || !value) {
    return apiError("Please provide a comment.", 400);
  }

  const data = await createComment({ projectId, taskId, userId, type, value });

  return apiSuccess("Comment added.", data);
}
