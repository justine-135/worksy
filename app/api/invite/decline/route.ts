import { getServerSession } from "next-auth";

import { declineInvite } from "@/db/projectInvite.db";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();
  const { invite_id } = body;

  if (!invite_id) {
    return apiError("Invalid invite request.", 400);
  }

  const data = await declineInvite(invite_id);

  return apiSuccess("Invite declined.", data);
}
