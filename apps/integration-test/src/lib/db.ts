import prisma from "@repo/database/client";

export async function resetDatabase() {
  await prisma.submission.deleteMany();
  await prisma.visibleTestCases.deleteMany();
  await prisma.hiddenTestCases.deleteMany();
  await prisma.problems.deleteMany();
  await prisma.problemTag.deleteMany();
  await prisma.starterCode.deleteMany();
  await prisma.calendar.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export { prisma };
