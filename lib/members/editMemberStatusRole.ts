import { EditMemberStatusRoleDTO } from "@/types/projectMember.dto";

export default async function editMemberStatusRole({
  roleId,
  status,
  userId,
}: EditMemberStatusRoleDTO) {
  const response = await fetch(`/api/member/status-role/${userId}/update`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      role_id: roleId,
      status,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to invite member");
  }

  return response.json();
}
