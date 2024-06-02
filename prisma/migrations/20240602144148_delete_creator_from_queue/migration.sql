/*
  Warnings:

  - You are about to drop the column `creator_id` on the `queues` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "queues" DROP CONSTRAINT "queues_creator_id_fkey";

-- AlterTable
ALTER TABLE "queues" DROP COLUMN "creator_id";
