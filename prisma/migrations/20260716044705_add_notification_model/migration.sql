-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MENTION', 'INVITE', 'ASSIGNED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('INAPP');

-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'PARENT_CHANGE';

-- AlterTable
ALTER TABLE "project" ADD COLUMN     "default_task_priority" TEXT DEFAULT 'medium';

-- AlterTable
ALTER TABLE "task_board" ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';

-- CreateTable
CREATE TABLE "task_relation" (
    "parent_id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_relation_pkey" PRIMARY KEY ("parent_id","child_id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_type_channel_key" ON "NotificationPreference"("userId", "type", "channel");

-- AddForeignKey
ALTER TABLE "task_relation" ADD CONSTRAINT "task_relation_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_relation" ADD CONSTRAINT "task_relation_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
