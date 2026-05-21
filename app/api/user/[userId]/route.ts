import { getUserById } from "@/db/user.db";
import { authConfig } from "@/lib/auth/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
    return Response.json({ error: "Missing user id" }, { status: 400 });
  }

  const data = await getUserById({ userId });

  return Response.json(data);
}
