import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { EditMemberStatusRoleDTO } from "@/types/projectMember.dto";
import { UserProjectParamsDTO } from "@/types/taskboard.dto";

/**
 * Bumps the user's `lastActivityAt` for a project so it floats to the top of
 * the sidebar "Recents" list. Call this from EVERY mutation a user performs
 * inside a project (task, member, role/permission, etc.).
 *
 * Pass the transaction client (`tx`) when calling inside a `$transaction` so
 * the bump commits/rolls back atomically with the action; otherwise it
 * defaults to the shared prisma singleton. `updateMany` is used (not `update`)
 * so it's a safe no-op when the actor isn't a member of the project.
 */
export async function touchProjectActivity(
  { userId, projectId }: UserProjectParamsDTO,
  client: Prisma.TransactionClient = prisma,
) {
  await client.projectMember.updateMany({
    where: { userId, projectId },
    data: { lastActivityAt: new Date() },
  });
}

export async function getProjectMembers({
  projectId,
  skip,
  take,
}: {
  projectId: string;
  skip: number;
  take: number;
}) {
  return prisma.$transaction(async (tx) => {
    const members = await tx.projectMember.findMany({
      where: { projectId },
      take,
      skip,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        user: true,
        status: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const count = await tx.projectMember.count({ where: { projectId } });

    return { data: members, count };
  });
}

export async function getProjectMember({
  userId,
  projectId,
}: UserProjectParamsDTO) {
  return prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });
}

/**
 * Resolve which project a membership row belongs to, by its `ProjectMember.id`
 * (for server-side permission checks). Note the members table passes the
 * membership id — not the user id — as this identifier.
 */
export async function getMemberProjectId(memberId: string) {
  const member = await prisma.projectMember.findUnique({
    where: { id: memberId },
    select: { projectId: true },
  });

  return member?.projectId ?? null;
}

export async function updateMemberStatusRole(
  data: EditMemberStatusRoleDTO,
  actorUserId: string,
) {
  return prisma.$transaction(async (tx) => {
    const member = await tx.projectMember.update({
      where: {
        id: data.userId,
      },
      data: {
        roleId: data.roleId,
        status: data.status,
      },
    });

    // The actor (whoever made the change) recently acted on this project.
    await touchProjectActivity(
      { userId: actorUserId, projectId: member.projectId },
      tx,
    );

    return member;
  });
}
