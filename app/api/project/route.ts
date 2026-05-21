import { createProjectDTO, getProjects } from "@/db/project.db";
import { authConfig } from "@/lib/auth/auth";
import { createProjectSchema } from "@/lib/validations/createProject.schema";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const createProjectRequestSchema = createProjectSchema.extend({
  ownerId: z.string().min(1, "Owner is required"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const parsed = createProjectRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = await createProjectDTO(parsed.data);

  return Response.json({ success: true, data });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return Response.json({ error: "Invalid session id" }, { status: 400 });
  }

  const data = await getProjects({ userId: user_id });

  return Response.json(data);
}
