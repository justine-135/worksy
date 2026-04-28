/*
  Warnings:

  - You are about to drop the `project_member_permission` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[key,role_id]` on the table `permission` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `role_id` to the `permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `project_member` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "project_member_permission" DROP CONSTRAINT "project_member_permission_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "project_member_permission" DROP CONSTRAINT "project_member_permission_project_member_id_fkey";

-- DropIndex
DROP INDEX "permission_key_key";

-- AlterTable
ALTER TABLE "permission" ADD COLUMN     "role_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "project_member" ADD COLUMN     "role_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "project_member_permission";

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_project_id_key" ON "roles"("name", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "permission_key_role_id_key" ON "permission"("key", "role_id");

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
