/*
  Warnings:

  - Added the required column `status` to the `project_member` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectMemberStatus" AS ENUM ('active', 'pending', 'inactive');

-- AlterTable
ALTER TABLE "project_member" ADD COLUMN     "status" "ProjectMemberStatus" NOT NULL;
