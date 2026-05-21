import { createMember } from "@/db/projectMember.db";
import { authConfig } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
