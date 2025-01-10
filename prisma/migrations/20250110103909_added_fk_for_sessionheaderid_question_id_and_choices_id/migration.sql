/*
  Warnings:

  - The primary key for the `SessionDetails` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "SessionDetails" DROP CONSTRAINT "SessionDetails_pkey",
ADD CONSTRAINT "SessionDetails_pkey" PRIMARY KEY ("question_id", "choices_id", "sessionHeader_id");
