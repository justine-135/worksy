import { getServerSession } from "next-auth";

import { createRole, getRoles } from "@/db/role.db";
import { Permissions } from "@/enum/permissions.enum";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { hasPermissionInProject } from "@/lib/permission/checkPermission";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("project_id");
  const skip = Number(searchParams.get("skip"));
  const take = Number(searchParams.get("take"));

  if (!projectId) {
    return apiError("Missing project id.", 400);
  }

  const data = await getRoles({ projectId, skip, take });

  return Response.json(data);
}

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const { projectId, name, permissions } = body;

  if (!projectId || !name || !permissions) {
    return apiError("Please provide a role name and permissions.", 400);
  }

  if (
    !(await hasPermissionInProject(
      projectId,
      session.user.id,
      Permissions.RolesCreate,
    ))
  ) {
    return apiError("Forbidden", 403);
  }

  const data = await createRole(
    { name, permissions, projectId },
    session.user.id,
  );

  return apiSuccess("Role created.", data);
}
