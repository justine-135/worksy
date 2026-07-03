import { getServerSession } from "next-auth";

import {
  getMemberProjectId,
  updateMemberStatusRole,
} from "@/db/projectMember.db";
import { Permissions } from "@/enum/permissions.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { userId } = await params;

  const body = await req.json();
  const { role_id, status } = body;

  if (!role_id || !status) {
    return apiError("Invalid member update.", 400);
  }

  // `userId` is the ProjectMember id — resolve its project server-side so the
  // permission check can't be bypassed by a spoofed body.
  const projectId = await getMemberProjectId(userId);

  if (
    !projectId ||
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.MemberEdit,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  const data = await updateMemberStatusRole(
    {
      userId,
      roleId: role_id,
      status,
    },
    session.user.id,
  );

  return apiSuccess("Member updated.", data);
}
