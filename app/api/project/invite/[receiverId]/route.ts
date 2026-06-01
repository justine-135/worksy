import {
  createProjectInvite,
  getProjectInvitesByReceiverId,
} from "@/db/projectInvite.db";
import { authConfig } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ receiverId: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { receiverId } = await params;

  if (!receiverId) {
    return NextResponse.json({ error: "Invalid receiver id" }, { status: 400 });
  }

  const data = await getProjectInvitesByReceiverId({ receiverId });

  return Response.json(data);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ receiverId: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { receiverId } = await params;

  const body = await req.json();

  const { sender_id, project_id } = body;

  if (!sender_id || !receiverId || !project_id) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const data = await createProjectInvite({
    senderId: sender_id,
    receiverId,
    projectId: project_id,
  });

  return Response.json({ success: true, data });
}
