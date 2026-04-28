import { getProjectMembers } from "@/db/projectMember.db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return Response.json({ error: "Invalid project id" }, { status: 400 });
  }

  const data = await getProjectMembers({ projectId });

  return Response.json(data);
}
