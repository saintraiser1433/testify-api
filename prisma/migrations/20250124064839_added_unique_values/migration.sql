/*
  Warnings:

  - A unique constraint covering the columns `[description]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[first_name]` on the table `Deans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_name]` on the table `Deans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[middle_name]` on the table `Deans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `Deans` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[department_name]` on the table `Department` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[exam_title]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact_number]` on the table `FollowUp` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[question]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[first_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[middle_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Course_description_key" ON "Course"("description");

-- CreateIndex
CREATE UNIQUE INDEX "Deans_first_name_key" ON "Deans"("first_name");

-- CreateIndex
CREATE UNIQUE INDEX "Deans_last_name_key" ON "Deans"("last_name");

-- CreateIndex
CREATE UNIQUE INDEX "Deans_middle_name_key" ON "Deans"("middle_name");

-- CreateIndex
CREATE UNIQUE INDEX "Deans_username_key" ON "Deans"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Department_department_name_key" ON "Department"("department_name");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_exam_title_key" ON "Exam"("exam_title");

-- CreateIndex
CREATE UNIQUE INDEX "FollowUp_contact_number_key" ON "FollowUp"("contact_number");

-- CreateIndex
CREATE UNIQUE INDEX "Question_question_key" ON "Question"("question");

-- CreateIndex
CREATE UNIQUE INDEX "User_first_name_key" ON "User"("first_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_last_name_key" ON "User"("last_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_middle_name_key" ON "User"("middle_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
