import { prisma } from "@/lib/prisma";
import { CreateTaskDTO } from "@/types/task.dto";

export async function createTaskDB(data: CreateTaskDTO) {
  return prisma.task.create({
    data,
  });
}
