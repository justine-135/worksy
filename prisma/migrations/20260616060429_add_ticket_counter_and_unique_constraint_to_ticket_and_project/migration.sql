/*
  Warnings:

  - A unique constraint covering the columns `[project_id,ticket_number]` on the table `task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `project_id` to the `task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" ADD COLUMN     "ticket_counter" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "project_id" TEXT NOT NULL,
ALTER COLUMN "ticket_number" DROP DEFAULT;
DROP SEQUENCE "task_ticket_number_seq";

-- CreateIndex
CREATE UNIQUE INDEX "task_project_id_ticket_number_key" ON "task"("project_id", "ticket_number");

-- AddForeignKey
ALTER TABLE "task" ADD CONSTRAINT "task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
