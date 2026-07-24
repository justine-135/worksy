import { getServerSession } from "next-auth";

import { createProjectDTO, getProjects } from "@/db/project.db";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();

  const { title, description, image_url } = body;

  if (!title) {
    return apiError("Provide at least the title", 400);
  }

  try {
    const data = await createProjectDTO({
      title,
      description,
      imageUrl: image_url,
      ownerId: session?.user?.id,
    });

    return apiSuccess("Project created.", data);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "Internal server error",
      400,
    );
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }
  const { searchParams } = new URL(req.url);

  const filter =
    (searchParams.get("filter") as "all" | "owned" | "shared" | "recent") ??
    "all";

  const data = await getProjects({
    userId: session?.user?.id,
    filter,
  });

  return Response.json(data);
}
