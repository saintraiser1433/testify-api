/*
  Warnings:

  - The primary key for the `Answers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ExamAttempt` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Examinee` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `first_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `middle_name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_examinee_id_fkey";

-- DropForeignKey
ALTER TABLE "ExamAttempt" DROP CONSTRAINT "ExamAttempt_examinee_id_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_pkey",
ALTER COLUMN "examinee_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Answers_pkey" PRIMARY KEY ("examinee_id", "exam_id", "question_id", "choices_id");

-- AlterTable
ALTER TABLE "ExamAttempt" DROP CONSTRAINT "ExamAttempt_pkey",
ALTER COLUMN "examinee_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ExamAttempt_pkey" PRIMARY KEY ("examinee_id", "exam_id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "first_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "last_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "middle_name" VARCHAR(100) NOT NULL,
ADD COLUMN     "username" VARCHAR(100) NOT NULL;

-- DropTable
DROP TABLE "Examinee";

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_examinee_id_fkey" FOREIGN KEY ("examinee_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAttempt" ADD CONSTRAINT "ExamAttempt_examinee_id_fkey" FOREIGN KEY ("examinee_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
