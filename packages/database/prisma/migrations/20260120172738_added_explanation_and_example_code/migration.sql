-- AlterTable
ALTER TABLE "Problems" ADD COLUMN     "constraints" TEXT[];

-- AlterTable
ALTER TABLE "VisibleTestCases" ADD COLUMN     "explanation" TEXT;

-- CreateTable
CREATE TABLE "StarterCode" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "StarterCode_pkey" PRIMARY KEY ("id")
);
