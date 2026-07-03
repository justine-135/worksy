import type { Prisma } from "@prisma/client";

import { ROLE_PRESETS } from "@/constant/role";
import { StatusDTO } from "@/enum/member";
import { prisma } from "@/lib/prisma";
import {
  CreateProjectDTO,
  ProjectDetailDTO,
  TProjectFilter,
  UpdateProjectSettingsDTO,
} from "@/types/project.dto";

import { touchProjectActivity } from "./projectMember.db";

export async function createProjectDTO(data: CreateProjectDTO) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const project = await tx.project.create({
      data: {
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        ownerId: data.ownerId,

        taskBoards: {
          create: [
            { title: "To Do 💻" },
            { title: "In Progress 🚀" },
            { title: "Done 👁️" },
          ],
        },
      },
    });

    const roles = await Promise.all(
      Object.values(ROLE_PRESETS).map((preset) =>
        tx.role.create({
          data: {
            name: preset.name,
            projectId: project.id,
            permissions: {
              create: preset.permissions.map((key) => ({ key })),
            },
          },
        }),
      ),
    );

    const ownerRole = roles.find((r) => r.name === "Owner");

    if (!ownerRole) {
      throw new Error("Owner role not created");
    }

    const member = await tx.projectMember.create({
      data: {
        userId: data.ownerId,
        projectId: project.id,
        roleId: ownerRole.id,
        status: StatusDTO.active,
      },
      select: { id: true },
    });

    return {
      ...project,
      members: [member],
    };
  });
}

// Shared shape so `getProjects` and `getRecentProjects` return the same DTO.
const PROJECT_SELECT = {
  id: true,
  title: true,
  description: true,
  imageUrl: true,
  members: {
    select: {
      id: true,
    },
  },
  owner: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.ProjectSelect;

export async function getProjects({
  userId,
  filter = "all",
}: {
  userId: string;
  filter?: TProjectFilter;
}) {
  if (filter === "recent") {
    return getRecentProjects(userId);
  }

  const where =
    filter === "owned"
      ? {
          ownerId: userId,
        }
      : filter === "shared"
        ? {
            NOT: {
              ownerId: userId,
            },
            members: {
              some: {
                userId,
              },
            },
          }
        : {
            members: {
              some: {
                userId,
              },
            },
          };

  return prisma.project.findMany({
    where,
    select: PROJECT_SELECT,
  });
}

// Projects the user has personally acted on (created/edited a task, moved a
// status, commented, changed members/roles, etc.), most recent action first.
//
// Every mutation calls `touchProjectActivity`, which stamps the user's
// `ProjectMember.lastActivityAt`. We just read the user's memberships that have
// been stamped and order by that timestamp — so any action floats the project
// to the top of "Recents".
export async function getRecentProjects(userId: string) {
  const memberships = await prisma.projectMember.findMany({
    where: {
      userId,
      lastActivityAt: { not: null },
    },
    orderBy: {
      lastActivityAt: "desc",
    },
    select: {
      project: {
        select: PROJECT_SELECT,
      },
    },
  });

  return memberships.map((m) => m.project);
}

// Single project fetched for the Settings tab. Any project member may read it
// (the layout already asserts membership); owner-only guards live on writes.
export async function getProjectDetail(
  projectId: string,
): Promise<ProjectDetailDTO | null> {
  return prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      ownerId: true,
      defaultTaskPriority: true,
    },
  });
}

// Owner-only. `assertProjectOwner` only checks membership, so we compare
// ownerId here to enforce true ownership before mutating project config.
async function assertOwnerOrThrow(
  client: Prisma.TransactionClient,
  userId: string,
  projectId: string,
) {
  const project = await client.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) throw new Error("Project not found");
  if (project.ownerId !== userId) throw new Error("Owner only");
}

export async function updateProjectSettings({
  userId,
  projectId,
  data,
}: {
  userId: string;
  projectId: string;
  data: UpdateProjectSettingsDTO;
}) {
  return prisma.$transaction(async (tx) => {
    await assertOwnerOrThrow(tx, userId, projectId);

    const updated = await tx.project.update({
      where: { id: projectId },
      data: {
        title: data.title,
        description: data.description,
        defaultTaskPriority: data.defaultTaskPriority,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        ownerId: true,
        defaultTaskPriority: true,
      },
    });

    // Editing project config is a project action → float it in "Recents".
    await touchProjectActivity({ userId, projectId }, tx);

    return updated;
  });
}

export async function deleteProject({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  return prisma.$transaction(async (tx) => {
    await assertOwnerOrThrow(tx, userId, projectId);

    // Schema cascades (members, tasks, boards, roles, invites, activity) on
    // project delete, so a single delete removes the whole tree.
    await tx.project.delete({ where: { id: projectId } });

    return { id: projectId };
  });
}
