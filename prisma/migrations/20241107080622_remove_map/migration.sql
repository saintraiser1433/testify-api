/*
  Warnings:

  - You are about to drop the `choices` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_choices_id_fkey";

-- DropForeignKey
ALTER TABLE "choices" DROP CONSTRAINT "choices_question_id_fkey";

-- DropTable
DROP TABLE "choices";

-- CreateTable
CREATE TABLE "Choices" (
    "choices_id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Choices_pkey" PRIMARY KEY ("choices_id")
);

-- AddForeignKey
ALTER TABLE "Choices" ADD CONSTRAINT "Choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "Question"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_choices_id_fkey" FOREIGN KEY ("choices_id") REFERENCES "Choices"("choices_id") ON DELETE RESTRICT ON UPDATE CASCADE;
