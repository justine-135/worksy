import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { updateProjectSettings } from "@/db/project.db";
import { authConfig } from "@/lib/auth/auth";
import { updateProjectSettingsSchema } from "@/lib/validations/updateProjectSettings.schema";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const parsed = updateProjectSettingsSchema.safeParse(body);

  if (!parsed.success) {
    // Keep `error` a string (the client toast reads it directly); the
    // per-field breakdown goes under `details`.
    return Response.json(
      {
        error: "Please check the highlighted fields.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const data = await updateProjectSettings({
      userId: session.user.id,
      projectId: id,
      data: parsed.data,
    });

    return Response.json({ success: true, data });
  } catch (error) {
    // Only surface known, safe sentinels; anything else (e.g. a raw Prisma
    // error) is collapsed to a generic message to avoid leaking internals.
    const raw = error instanceof Error ? error.message : "";
    if (raw === "Owner only") {
      return NextResponse.json({ error: raw }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Failed to update project settings." },
      { status: 400 },
    );
  }
}
