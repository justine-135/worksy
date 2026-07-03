import { getServerSession } from "next-auth";

import { getProjects } from "@/db/project.db";
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
    return apiError("Invalid session id.", 400);
  }

  const { searchParams } = new URL(req.url);

  const filter =
    (searchParams.get("filter") as "all" | "owned" | "shared" | "recent") ??
    "all";

  const data = await getProjects({
    userId,
    filter,
  });

  return Response.json(data);
}
