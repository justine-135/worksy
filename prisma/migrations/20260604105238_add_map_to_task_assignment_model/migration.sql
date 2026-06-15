/*
  Warnings:

  - You are about to drop the `TaskAssignment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_project_member_id_fkey";

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_task_id_fkey";

-- DropTable
DROP TABLE "TaskAssignment";

-- CreateTable
CREATE TABLE "task_assignment" (
    "task_id" TEXT NOT NULL,
    "project_member_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_assignment_pkey" PRIMARY KEY ("task_id","project_member_id")
);

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment" ADD CONSTRAINT "task_assignment_project_member_id_fkey" FOREIGN KEY ("project_member_id") REFERENCES "project_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
