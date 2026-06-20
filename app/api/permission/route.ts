import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getPermissions } from "@/db/permission.db";
import { authConfig } from "@/lib/auth/auth";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getPermissions();

  return Response.json(data);
}
