/*
  Warnings:

  - A unique constraint covering the columns `[first_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[last_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_first_name_key" ON "User"("first_name");

-- CreateIndex
CREATE UNIQUE INDEX "User_last_name_key" ON "User"("last_name");
