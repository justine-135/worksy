import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { deleteProject, getProjectDetail } from "@/db/project.db";
import { getProjectMember } from "@/db/projectMember.db";
import { authConfig } from "@/lib/auth/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Only project members may read the project detail.
  const member = await getProjectMember({
    userId: session.user.id,
    projectId: id,
  });

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const project = await getProjectDetail(id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return Response.json({ success: true, data: project });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await deleteProject({ userId: session.user.id, projectId: id });
    return Response.json({ success: true, data });
  } catch (error) {
    // Surface only the known "Owner only" sentinel; collapse everything else to
    // a generic message so raw Prisma errors don't reach the client.
    const raw = error instanceof Error ? error.message : "";
    if (raw === "Owner only") {
      return NextResponse.json({ error: raw }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to delete project." },
      { status: 400 },
    );
  }
}
