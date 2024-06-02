/*
  Warnings:

  - A unique constraint covering the columns `[lab_id]` on the table `queues` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "queues_lab_id_key" ON "queues"("lab_id");
