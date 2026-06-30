import { prisma } from "@/lib/prisma";
import { deriveStatusFromColumn } from "@/lib/task/taskStatus.lib";

/**
 * One-time backfill: set every existing task's `status` from the column it
 * currently sits in, using the same column-position rule as drag-to-move
 * (first column -> Todo, last -> Done, middle -> In Progress).
 *
 * Safe to re-run — it simply recomputes status from the current column.
 *
 *   npx tsx prisma/backfill-task-status.ts
 */
async function main() {
  const projects = await prisma.project.findMany({ select: { id: true } });

  let updated = 0;

  for (const project of projects) {
    const boards = await prisma.taskBoard.findMany({
      where: { projectId: project.id },
      orderBy: { order: "asc" },
      select: { id: true },
    });
    const orderedBoardIds = boards.map((board) => board.id);

    const tasks = await prisma.task.findMany({
      where: { projectId: project.id },
      select: { id: true, taskBoardId: true },
    });

    for (const task of tasks) {
      const status = deriveStatusFromColumn(task.taskBoardId, orderedBoardIds);
      if (!status) continue;

      await prisma.task.update({
        where: { id: task.id },
        data: { status },
      });
      updated += 1;
    }
  }

  console.log(`Backfilled status for ${updated} task(s).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
