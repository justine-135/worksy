import { NextRequest, NextResponse } from "next/server";
import { checkPermissionDB } from "@/db/permission.db"; // Safe to import here! (Server environment)
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const permissions = await checkPermissionDB(projectId, session.user.id);

  return NextResponse.json({ permissions });
}
