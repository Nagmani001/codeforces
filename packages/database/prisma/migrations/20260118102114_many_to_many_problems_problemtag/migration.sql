/*
  Warnings:

  - You are about to drop the column `problemId` on the `ProblemTag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProblemTag" DROP CONSTRAINT "ProblemTag_problemId_fkey";

-- AlterTable
ALTER TABLE "ProblemTag" DROP COLUMN "problemId";

-- CreateTable
CREATE TABLE "_ProblemTagToProblems" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProblemTagToProblems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProblemTagToProblems_B_index" ON "_ProblemTagToProblems"("B");

-- AddForeignKey
ALTER TABLE "_ProblemTagToProblems" ADD CONSTRAINT "_ProblemTagToProblems_A_fkey" FOREIGN KEY ("A") REFERENCES "ProblemTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemTagToProblems" ADD CONSTRAINT "_ProblemTagToProblems_B_fkey" FOREIGN KEY ("B") REFERENCES "Problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
