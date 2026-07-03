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
    return Response.json(
      { error: parsed.error.flatten().fieldErrors },
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
    const message = error instanceof Error ? error.message : "Failed to update";
    const status = message === "Owner only" ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
