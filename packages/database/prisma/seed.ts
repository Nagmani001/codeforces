import prisma from "../src";
import { problemTags, problemsData, starterCodes } from "./seedData";

const ADMIN_USER_ID = "zqbH1efNyBxitiwAdJY3Rdo9br6qFGw4";

async function main() {
  console.log("🌱 Starting database seed...\n");

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
