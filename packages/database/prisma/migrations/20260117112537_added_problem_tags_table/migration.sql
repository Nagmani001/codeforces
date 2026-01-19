/*
  Warnings:

  - Added the required column `problemType` to the `Problems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Problems` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ResultVerdict" AS ENUM ('ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR');

-- CreateEnum
CREATE TYPE "ProblemType" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('SOLVED', 'ATTEMPTED', 'UNSOLVED');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('CPP', 'RUST', 'JAVASCRIPT', 'PYTHON', 'JAVA');

-- AlterTable
ALTER TABLE "Problems" ADD COLUMN     "problemType" "ProblemType" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "language" "Language" NOT NULL DEFAULT 'CPP',
    "status" "ProblemStatus" NOT NULL DEFAULT 'UNSOLVED',
    "resultVerdict" "ResultVerdict",
    "problemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemTag" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,

    CONSTRAINT "ProblemTag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Submission_problemId_userId_key" ON "Submission"("problemId", "userId");

-- AddForeignKey
ALTER TABLE "Problems" ADD CONSTRAINT "Problems_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemTag" ADD CONSTRAINT "ProblemTag_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
