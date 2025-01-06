/*
  Warnings:

  - The primary key for the `FollowUp` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `examineeId` on the `FollowUp` table. All the data in the column will be lost.
  - Added the required column `examinee_id` to the `FollowUp` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FollowUp" DROP CONSTRAINT "FollowUp_examineeId_fkey";

-- AlterTable
ALTER TABLE "FollowUp" DROP CONSTRAINT "FollowUp_pkey",
DROP COLUMN "examineeId",
ADD COLUMN     "examinee_id" VARCHAR(100) NOT NULL,
ADD CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("examinee_id");

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_examinee_id_fkey" FOREIGN KEY ("examinee_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
