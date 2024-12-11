/*
  Warnings:

  - You are about to alter the column `contact_number` on the `FollowUp` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `VarChar(13)`.

*/
-- AlterTable
ALTER TABLE "FollowUp" ALTER COLUMN "contact_number" SET DATA TYPE VARCHAR(13);
