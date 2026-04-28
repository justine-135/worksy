-- DropForeignKey
ALTER TABLE "project_member" DROP CONSTRAINT "project_member_role_id_fkey";

-- AlterTable
ALTER TABLE "project_member" ALTER COLUMN "role_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "project_member" ADD CONSTRAINT "project_member_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
