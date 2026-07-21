-- DropForeignKey
ALTER TABLE "activity_log" DROP CONSTRAINT "activity_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "activity_log" DROP CONSTRAINT "activity_log_task_id_fkey";

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "project_member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
