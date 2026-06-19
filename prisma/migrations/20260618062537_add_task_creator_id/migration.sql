/*
  Warnings:

  - Added the required column `creator_id` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "task" ADD COLUMN     "creator_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "project_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
