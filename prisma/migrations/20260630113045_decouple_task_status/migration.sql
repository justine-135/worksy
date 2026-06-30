/*
  Warnings:

  - You are about to drop the column `from_board_id` on the `status_change_detail` table. All the data in the column will be lost.
  - You are about to drop the column `to_board_id` on the `status_change_detail` table. All the data in the column will be lost.
  - Added the required column `from_status` to the `status_change_detail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to_status` to the `status_change_detail` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'COLUMN_CHANGE';
ALTER TYPE "ActivityType" ADD VALUE 'TASK_CREATE';
ALTER TYPE "ActivityType" ADD VALUE 'ASSIGNEE_CHANGE';

-- DropForeignKey
ALTER TABLE "status_change_detail" DROP CONSTRAINT "status_change_detail_from_board_id_fkey";

-- DropForeignKey
ALTER TABLE "status_change_detail" DROP CONSTRAINT "status_change_detail_to_board_id_fkey";

-- AlterTable
ALTER TABLE "project_member" ADD COLUMN     "last_activity_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "status_change_detail" DROP COLUMN "from_board_id",
DROP COLUMN "to_board_id",
ADD COLUMN     "from_status" "TaskStatus" NOT NULL,
ADD COLUMN     "to_status" "TaskStatus" NOT NULL;

-- AlterTable
ALTER TABLE "task" ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';

-- CreateTable
CREATE TABLE "column_change_detail" (
    "id" TEXT NOT NULL,
    "activity_log_id" TEXT NOT NULL,
    "from_board_id" TEXT NOT NULL,
    "to_board_id" TEXT NOT NULL,

    CONSTRAINT "column_change_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "column_change_detail_activity_log_id_key" ON "column_change_detail"("activity_log_id");

-- AddForeignKey
ALTER TABLE "column_change_detail" ADD CONSTRAINT "column_change_detail_activity_log_id_fkey" FOREIGN KEY ("activity_log_id") REFERENCES "activity_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "column_change_detail" ADD CONSTRAINT "column_change_detail_from_board_id_fkey" FOREIGN KEY ("from_board_id") REFERENCES "task_board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "column_change_detail" ADD CONSTRAINT "column_change_detail_to_board_id_fkey" FOREIGN KEY ("to_board_id") REFERENCES "task_board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
