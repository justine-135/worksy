import { getServerSession } from "next-auth";

import { getUser } from "@/db/user.db";
import { apiError } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query");
  const currentId = searchParams.get("current_id");

  if (!query || !currentId) {
    return apiError("Missing search parameters.", 400);
  }

  const data = await getUser({ query, currentUserId: currentId });

  return Response.json(data);
}
