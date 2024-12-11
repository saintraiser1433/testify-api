/*
  Warnings:

  - Changed the type of `contact_number` on the `FollowUp` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FollowUp" DROP COLUMN "contact_number",
ADD COLUMN     "contact_number" INTEGER NOT NULL;
