import { ROLE_PRESETS } from "@/constant/role";
import { StatusDTO } from "@/enum/member";
import { prisma } from "@/lib/prisma";
import { CreateProjectDTO, TProjectFilter } from "@/types/project.dto";
import type { Prisma } from "@prisma/client";

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

export async function getProjects({
  userId,
  filter = "all",
}: {
  userId: string;
  filter?: TProjectFilter;
}) {
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
    select: {
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
    },
  });
}
