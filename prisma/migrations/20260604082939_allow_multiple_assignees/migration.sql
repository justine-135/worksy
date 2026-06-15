/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "task" DROP CONSTRAINT "task_assigneeId_fkey";

-- AlterTable
ALTER TABLE "task" DROP COLUMN "assigneeId";

-- CreateTable
CREATE TABLE "_ProjectMemberToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProjectMemberToTask_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProjectMemberToTask_B_index" ON "_ProjectMemberToTask"("B");

-- AddForeignKey
ALTER TABLE "_ProjectMemberToTask" ADD CONSTRAINT "_ProjectMemberToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "project_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectMemberToTask" ADD CONSTRAINT "_ProjectMemberToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
