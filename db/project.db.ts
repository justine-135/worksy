import { prisma } from "@/lib/prisma";
import { CreateProjectDTO } from "@/types/project.dto";

export async function createProjectDTO(data: CreateProjectDTO) {
  const create = await prisma.project.create({
    data,
  });

  return create;
}
