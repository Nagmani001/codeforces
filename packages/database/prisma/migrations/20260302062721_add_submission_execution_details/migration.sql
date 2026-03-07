-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "compilationError" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "failedTestCaseNumber" INTEGER,
ADD COLUMN     "maxCpuTime" INTEGER,
ADD COLUMN     "maxMemoryUsed" INTEGER,
ADD COLUMN     "totalTestCases" INTEGER;
