/*
  Warnings:

  - Added the required column `lab_id` to the `queues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "queues" ADD COLUMN     "lab_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "LabWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
