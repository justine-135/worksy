/*
  Warnings:

  - You are about to drop the `_ProjectMemberToTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProjectMemberToTask" DROP CONSTRAINT "_ProjectMemberToTask_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProjectMemberToTask" DROP CONSTRAINT "_ProjectMemberToTask_B_fkey";

-- DropTable
DROP TABLE "_ProjectMemberToTask";

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "task_id" TEXT NOT NULL,
    "project_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("task_id","project_member_id")
);

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_project_member_id_fkey" FOREIGN KEY ("project_member_id") REFERENCES "project_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
