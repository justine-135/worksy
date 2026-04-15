import { createProjectDTO, getProjects } from "@/db/project.db";

export async function POST(req: Request) {
  const body = await req.json();
  const { title, description, ownerId } = body;

  if (!title || !ownerId) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = await createProjectDTO({
    title,
    description,
    ownerId,
  });

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
