import { getServerSession } from "next-auth";

import { getUserById } from "@/db/user.db";
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }
  const { userId } = await params;

  if (!userId) {
    return apiError("Missing user id.", 400);
  }

  const data = await getUserById({ userId });

  return Response.json(data);
}
