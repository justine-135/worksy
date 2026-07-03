import { getServerSession } from "next-auth";

import {
  createProjectInvite,
  getProjectInvitesByReceiverId,
} from "@/db/projectInvite.db";
import { Permissions } from "@/enum/permissions.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ receiverId: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }
  const { receiverId } = await params;

  if (!receiverId) {
    return apiError("Invalid receiver id.", 400);
  }

  const data = await getProjectInvitesByReceiverId({ receiverId });

  return Response.json(data);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ receiverId: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }
  const { receiverId } = await params;

  const body = await req.json();

  const { sender_id, project_id } = body;

  if (!sender_id || !receiverId || !project_id) {
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

  const data = await createProjectInvite({
    senderId: sender_id,
    receiverId,
    projectId: project_id,
  });

  return apiSuccess("Invite sent.", data);
}
