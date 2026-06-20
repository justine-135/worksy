import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getUser } from "@/db/user.db";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const query = searchParams.get("query");
  const currentId = searchParams.get("current_id");

  if (!query || !currentId) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const data = await getUser({ query, currentUserId: currentId });

  return Response.json(data);
}
