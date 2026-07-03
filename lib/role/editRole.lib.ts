import { throwApiError } from "@/lib/api/apiMessage.lib";
import { EditRoleInput } from "@/types/roles.dto";

export default async function editRole({
  name,
  permissions,
  roleId,
}: EditRoleInput) {
  const response = await fetch(`/api/role/${roleId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      permissions,
    }),
  });

  if (!response.ok) await throwApiError(response, "Failed to create role");

  return response.json();
}
