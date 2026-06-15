/*
  Warnings:

  - You are about to drop the column `tickerNumber` on the `task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "task" DROP COLUMN "tickerNumber",
ADD COLUMN     "ticket_number" SERIAL NOT NULL;
