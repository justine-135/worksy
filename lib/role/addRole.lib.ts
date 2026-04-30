import { CreateRoleInput } from "@/types/roles.dto";

export default async function addRole({
  name,
  permissions,
  projectId,
}: CreateRoleInput) {
  const response = await fetch("/api/role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      permissions,
      projectId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create role");
  }

  return response.json();
}
