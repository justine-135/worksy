import { getUser } from "@/db/user.db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query");
  const currentId = searchParams.get("current_id");

  if (!query || !currentId) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const data = await getUser({ query, currentUserId: currentId });

  return Response.json(data);
}
