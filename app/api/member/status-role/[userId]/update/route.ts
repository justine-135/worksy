import { updateMemberStatusRole } from "@/db/projectMember.db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;

  const body = await req.json();
  const { role_id, status } = body;

  if (!role_id || !status) {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  console.log(role_id, status, userId);

  const data = await updateMemberStatusRole({
    userId,
    roleId: role_id,
    status,
  });

  return Response.json({ success: true, data });
}
