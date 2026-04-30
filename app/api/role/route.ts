import { createRole, getRoles } from "@/db/role.db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return Response.json({ error: "Invalid project id" }, { status: 400 });
  }

  const data = await getRoles({ projectId });

  return Response.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { projectId, name, permissions } = body;

  if (!projectId || !name || !permissions) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  await createRole({ name, permissions, projectId });

  return Response.json({ success: true });
}
