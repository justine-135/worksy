/*
  Warnings:

  - You are about to drop the column `role` on the `project_member` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project_member" DROP COLUMN "role";

-- DropEnum
DROP TYPE "EProjectMember";

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMemberPermission" (
    "id" TEXT NOT NULL,
    "project_member_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "ProjectMemberPermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMemberPermission_project_member_id_permission_id_key" ON "ProjectMemberPermission"("project_member_id", "permission_id");

-- AddForeignKey
ALTER TABLE "ProjectMemberPermission" ADD CONSTRAINT "ProjectMemberPermission_project_member_id_fkey" FOREIGN KEY ("project_member_id") REFERENCES "project_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMemberPermission" ADD CONSTRAINT "ProjectMemberPermission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
