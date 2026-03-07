import prisma from "../src";
import { problemTags, problemsData, starterCodes } from "./seedData";
import { hashPassword } from "better-auth/crypto";

const ADMIN_USER_ID = "yPKe9GTaKVW1og4y0XXsRqGgRmymSe3u";
const ADMIN_PASSWORD = "nagmaniupadhyay";

async function main() {
  console.log("🌱 Starting database seed...\n");

  console.log("creating admin user");

  const findUser = await prisma.user.findUnique({
    where: {
      id: ADMIN_USER_ID
    }
  });
  if (!findUser) {
    await prisma.user.create({
      data: {
        id: ADMIN_USER_ID,
        name: "nagmani",
        email: "nagmanipd3@gmail.com",
        emailVerified: true,
        image: "asdf",
        isAdmin: true,
      }
    });

    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: ADMIN_USER_ID,
        providerId: "credential",
        userId: ADMIN_USER_ID,
        password: hashedPassword,
      }
    });
    console.log(`Admin credentials -> email: nagmanipd3@gmail.com, password: ${ADMIN_PASSWORD}`);
  }


  console.log("📌 Seeding problem tags...");
  await prisma.problemTag.createMany({
    data: problemTags,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${problemTags.length} problem tags\n`);

  const tagsFromDb = await prisma.problemTag.findMany();
  const tagMap = new Map(tagsFromDb.map((tag) => [tag.title, tag.id]));

  console.log("📝 Seeding problems...");
  let createdCount = 0;
  let skippedCount = 0;

  for (const problem of problemsData) {
    const existing = await prisma.problems.findFirst({
      where: { title: problem.title },
    });

    if (existing) {
      skippedCount++;
      continue;
    }

    /*
    INFO: (id): id is string, this means: 
    Trust me: if this function returns true, whatever was passed as id is guaranteed to be a string from now on
    */
    const tagIds = problem.tags
      .map((tagTitle) => tagMap.get(tagTitle))
      .filter((id): id is string => id !== undefined);

    /*
    INFO:  
    */
    await prisma.problems.create({
      data: {
        title: problem.title,
        description: problem.description,
        problemType: problem.problemType,
        cpuTimeLimit: problem.cpuTimeLimit,
        memoryTimeLimit: problem.memoryTimeLimit,
        constraints: problem.constraints,
        userId: ADMIN_USER_ID,
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
        visibleTestCases: {
          create: problem.visibleTestCases.map((tc) => ({
            input: tc.input,
            output: tc.output,
            explanation: tc.explanation,
          })),
        },
        hiddenTestCases: {
          create: problem.hiddenTestCases.map((tc) => ({
            input: tc.input,
            output: tc.output,
          })),
        },
      },
    });

    createdCount++;
  }

  console.log(`✅ Created ${createdCount} problems`);
  if (skippedCount > 0) {
    console.log(` Skipped ${skippedCount} existing problems`);
  }

  // Seed StarterCode table
  console.log("\n💻 Seeding starter code templates...");
  await prisma.starterCode.createMany({
    data: starterCodes,
    skipDuplicates: true,
  });
  console.log(`✅ Seeded ${starterCodes.length} starter code templates`);

  const totalProblems = await prisma.problems.count();
  const totalVisibleTestCases = await prisma.visibleTestCases.count();
  const totalHiddenTestCases = await prisma.hiddenTestCases.count();
  const totalStarterCodes = await prisma.starterCode.count();

  console.log("\n📊 Database Summary:");
  console.log(`   - Problems: ${totalProblems}`);
  console.log(`   - Visible Test Cases: ${totalVisibleTestCases}`);
  console.log(`   - Hidden Test Cases: ${totalHiddenTestCases}`);
  console.log(`   - Starter Code Templates: ${totalStarterCodes}`);
  console.log("\n🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
