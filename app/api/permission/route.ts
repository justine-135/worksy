import { getServerSession } from "next-auth";

import { getPermissions } from "@/db/permission.db";
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const data = await getPermissions();

  return Response.json(data);
}
