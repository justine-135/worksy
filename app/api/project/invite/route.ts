import { getServerSession } from "next-auth";

import {
  createProjectInvite,
  getProjectInvitesByReceiverId,
} from "@/db/projectInvite.db";
import { Permissions } from "@/enum/permissions.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const data = await getProjectInvitesByReceiverId({
    receiverId: session?.user?.id,
  });

  return Response.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();

  const { project_id, receiver_id } = body;

  if (!receiver_id || !project_id) {
    return apiError("Missing required fields.", 400);
  }

  if (
    !(await hasPermissionInProject(
      project_id,
      session.user.id,
      Permissions.MemberInvite,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  try {
    const data = await createProjectInvite({
      senderId: session?.user?.id,
      receiverId: receiver_id,
      projectId: project_id,
    });

    return apiSuccess("Invite sent.", data);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Internal server error",
      400,
    );
  }
}
