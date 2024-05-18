/*
  Warnings:

  - You are about to drop the column `position` on the `queues` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `queues` table. All the data in the column will be lost.
  - You are about to drop the `LabWork` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creator_id` to the `queues` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LabWork" DROP CONSTRAINT "LabWork_user_id_fkey";

-- DropForeignKey
ALTER TABLE "queues" DROP CONSTRAINT "queues_lab_id_fkey";

-- DropForeignKey
ALTER TABLE "queues" DROP CONSTRAINT "queues_user_id_fkey";

-- DropIndex
DROP INDEX "queues_position_key";

-- DropIndex
DROP INDEX "queues_user_id_key";

-- AlterTable
ALTER TABLE "queues" DROP COLUMN "position",
DROP COLUMN "user_id",
ADD COLUMN     "creator_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "LabWork";

-- CreateTable
CREATE TABLE "user_queues" (
    "user_id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_queues_pkey" PRIMARY KEY ("queue_id","user_id")
);

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_queues" ADD CONSTRAINT "user_queues_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_queues" ADD CONSTRAINT "user_queues_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
