import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getProjects } from "@/db/project.db";
import { authConfig } from "@/lib/auth/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);

  const filter =
    (searchParams.get("filter") as "all" | "owned" | "shared" | "recent") ??
    "all";

  const data = await getProjects({
    userId,
    filter,
  });

  return Response.json(data);
}
