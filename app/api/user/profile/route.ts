import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { getUserProfile, updateUserProfile } from "@/db/user.db";
import { authConfig } from "@/lib/auth/auth";
import { updateProfileSchema } from "@/lib/validations/updateProfile.schema";

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getUserProfile({ userId: session.user.id });

  if (!data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ success: true, data });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  // A user can only edit their own profile — always key off the session id,
  // never a body-supplied userId.
  const data = await updateUserProfile({
    userId: session.user.id,
    name: parsed.data.name,
    image: parsed.data.image,
  });

  return Response.json({ success: true, data });
}
