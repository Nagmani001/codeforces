/*
  Warnings:

  - Changed the type of `language` on the `StarterCode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Language" ADD VALUE 'GO';
ALTER TYPE "Language" ADD VALUE 'TYPESCRIPT';

-- DropForeignKey
ALTER TABLE "HiddenTestCases" DROP CONSTRAINT "HiddenTestCases_problemId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_problemId_fkey";

-- DropForeignKey
ALTER TABLE "VisibleTestCases" DROP CONSTRAINT "VisibleTestCases_problemId_fkey";

-- AlterTable
ALTER TABLE "StarterCode" DROP COLUMN "language",
ADD COLUMN     "language" "Language" NOT NULL;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisibleTestCases" ADD CONSTRAINT "VisibleTestCases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiddenTestCases" ADD CONSTRAINT "HiddenTestCases_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
