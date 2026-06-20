import { redirect } from "next/navigation";

import { getProjectMember } from "@/db/projectMember.db";

export async function assertProjectMember({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  const member = await getProjectMember({ userId, projectId });

  if (!member) redirect("/projects?toast=1&msg=project_not_found");
  return;
}

export async function assertProjectOwner(userId: string, projectId: string) {
  const member = await getProjectMember({ userId, projectId });

  if (!member) {
    throw new Error("Owner only");
  }

  return member;
}
