import { getTaskBoard } from "@/db/taskboard.db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const user_id = searchParams.get("user_id");
  const project_id = searchParams.get("project_id");

  if (!user_id || !project_id) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const data = await getTaskBoard(user_id, project_id);

  return Response.json(data);
}
