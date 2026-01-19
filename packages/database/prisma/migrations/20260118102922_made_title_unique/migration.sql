/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `ProblemTag` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProblemTag_title_key" ON "ProblemTag"("title");
