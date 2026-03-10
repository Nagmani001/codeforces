import { prisma } from "./db";

export async function seedStarterCode() {
  const languages = ["CPP", "JAVASCRIPT", "TYPESCRIPT", "RUST", "GO", "PYTHON", "JAVA"] as const;
  for (const language of languages) {
    await prisma.starterCode.create({
      data: {
        language,
        code: `// starter for ${language}`,
      },
    });
  }
}

export async function seedTags(titles: string[]) {
  const tags = [];
  for (const title of titles) {
    const tag = await prisma.problemTag.create({
      data: {
        title,
        fixed: false,
      },
    });
    tags.push(tag);
  }
  return tags;
}

export async function seedProblem(args: {
  title: string;
  problemType: "EASY" | "MEDIUM" | "HARD";
  tags: { id: string }[];
  userId: string;
}) {
  return prisma.problems.create({
    data: {
      title: args.title,
      description: `${args.title} description`,
      problemType: args.problemType,
      constraints: ["1 <= n <= 10"],
      cpuTimeLimit: 2000,
      memoryTimeLimit: 256000,
      tags: {
        connect: args.tags,
      },
      visibleTestCases: {
        create: [
          { input: "1\n", output: "1\n" },
        ],
      },
      hiddenTestCases: {
        create: [
          { input: "2\n", output: "2\n" },
        ],
      },
      userId: args.userId,
    },
  });
}
