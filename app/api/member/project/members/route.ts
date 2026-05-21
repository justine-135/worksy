import { getProjectMembers } from "@/db/projectMember.db";
import { authConfig } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return Response.json({ error: "Invalid project id" }, { status: 400 });
  }

  const data = await getProjectMembers({ projectId });

  return Response.json(data);
}
