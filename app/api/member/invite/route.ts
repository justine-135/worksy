import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { acceptInvite } from "@/db/projectInvite.db";
import { authConfig } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { invite_id } = body;

  if (!invite_id) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = await acceptInvite(invite_id);

  return Response.json({ success: true, data });
}
