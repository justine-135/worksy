/*
  Warnings:

  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectMemberPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectMemberPermission" DROP CONSTRAINT "ProjectMemberPermission_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "ProjectMemberPermission" DROP CONSTRAINT "ProjectMemberPermission_project_member_id_fkey";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "ProjectMemberPermission";

-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_member_permission" (
    "id" TEXT NOT NULL,
    "project_member_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "project_member_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_key_key" ON "permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "project_member_permission_project_member_id_permission_id_key" ON "project_member_permission"("project_member_id", "permission_id");

-- AddForeignKey
ALTER TABLE "project_member_permission" ADD CONSTRAINT "project_member_permission_project_member_id_fkey" FOREIGN KEY ("project_member_id") REFERENCES "project_member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member_permission" ADD CONSTRAINT "project_member_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
