import { ERoles } from "@/enum/role";
import { prisma } from "@/lib/prisma";
import { CreateProjectDTO, ProjectsResponseDTO } from "@/types/project.dto";

export async function createProjectDTO(data: CreateProjectDTO) {
  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      ownerId: data.ownerId,

      members: {
        create: {
          userId: data.ownerId,
          role: ERoles.OWNER,
        },
      },

      taskBoards: {
        create: [
          { title: "To Do 💻" },
          { title: "In Progress 🚀" },
          { title: "Done 👁️" },
        ],
      },
    },
    include: {
      members: {
        select: {
          id: true,
        },
      },
    },
  });

  return project;
}

export async function getProjects({ userId }: { userId: string }) {
  const projects = await prisma.project.findMany({
    where: {
      ownerId: userId,
      members: {
        every: {
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
