import type { Prisma } from "@prisma/client";

import { ROLE_PRESETS } from "@/constant/role";
import { StatusDTO } from "@/enum/member";
import { prisma } from "@/lib/prisma";
import { CreateProjectDTO, TProjectFilter } from "@/types/project.dto";

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
