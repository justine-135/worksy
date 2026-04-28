import { ROLE_PRESETS } from "@/constant/role";
import { prisma } from "@/lib/prisma";
import { CreateProjectDTO, ProjectsResponseDTO } from "@/types/project.dto";

export async function createProjectDTO(data: CreateProjectDTO) {
  return await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        title: data.title,
        description: data.description,
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

    // 2. Create Roles (Owner + Member)
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

    // 3. Find Owner role
    const ownerRole = roles.find((r) => r.name === "Owner");

    if (!ownerRole) {
      throw new Error("Owner role not created");
    }

    // 4. Assign creator as ProjectMember (Owner)
    const member = await tx.projectMember.create({
      data: {
        userId: data.ownerId,
        projectId: project.id,
        roleId: ownerRole.id,
      },
      select: { id: true },
    });

    return {
      ...project,
      members: [member],
    };
  });
}

export async function getProjects({ userId }: { userId: string }) {
  const projects = await prisma.project.findMany({
    where: {
      ownerId: userId,
      members: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
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

  return projects as ProjectsResponseDTO[];
}
