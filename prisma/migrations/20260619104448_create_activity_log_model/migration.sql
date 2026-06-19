-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('STATUS_CHANGE', 'COMMENT');

-- CreateTable
CREATE TABLE "activity_log" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "task_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_change_detail" (
    "id" TEXT NOT NULL,
    "activity_log_id" TEXT NOT NULL,
    "from_board_id" TEXT NOT NULL,
    "to_board_id" TEXT NOT NULL,

    CONSTRAINT "status_change_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "status_change_detail_activity_log_id_key" ON "status_change_detail"("activity_log_id");

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "project_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_change_detail" ADD CONSTRAINT "status_change_detail_activity_log_id_fkey" FOREIGN KEY ("activity_log_id") REFERENCES "activity_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_change_detail" ADD CONSTRAINT "status_change_detail_from_board_id_fkey" FOREIGN KEY ("from_board_id") REFERENCES "task_board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_change_detail" ADD CONSTRAINT "status_change_detail_to_board_id_fkey" FOREIGN KEY ("to_board_id") REFERENCES "task_board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
