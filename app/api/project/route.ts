import { getServerSession } from "next-auth";
import { z } from "zod";

import { createProjectDTO } from "@/db/project.db";
import { apiError, apiSuccess } from "@/lib/api/apiResponse.lib";
import { authConfig } from "@/lib/auth/auth";
import { createProjectSchema } from "@/lib/validations/createProject.schema";

const createProjectRequestSchema = createProjectSchema.extend({
  ownerId: z.string().min(1, "Owner is required"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return apiError("You must be signed in to continue.", 401);
  }

  const body = await req.json();

  const parsed = createProjectRequestSchema.safeParse(body);

  if (!parsed.success) {
    return apiError(
      "Please correct the highlighted fields.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = await createProjectDTO(parsed.data);

  return apiSuccess("Project created.", data);
}
