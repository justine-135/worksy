import { throwApiError } from "@/lib/api/apiMessage.lib";
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

  if (!response.ok) await throwApiError(response, "Failed to invite member");

  return response.json();
}
