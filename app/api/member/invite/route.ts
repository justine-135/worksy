import { createMember } from "@/db/projectMember.db";

export async function POST(req: Request) {
  const body = await req.json();
  const { user_id, project_id } = body;

  if (!user_id || !project_id) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = await createMember({
    userId: user_id,
    projectId: project_id,
  });

  return Response.json({ success: true, data });
}
