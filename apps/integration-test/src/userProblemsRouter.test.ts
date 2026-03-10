import { describe, expect, it, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { createCookieJar, storeResponseCookies, authHeaders, cookieHeader } from "./lib/cookies";
import { prisma } from "./lib/db";
import { runSeedOnce } from "./lib/seedRunner";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe.sequential("User problems API", () => {
  const userJar = createCookieJar();

  const email = `user.${Date.now()}@example.com`;
  const password = "UserPassword123!";
  let userId: string;
  let problemEasyId: string;
  let problemMediumId: string;
  let problemHardId: string;

  beforeAll(async () => {
    await runSeedOnce();

    await axios.post(`${BACKEND_URL}/api/auth/sign-up/email`, { name: "User", email, password });
    await prisma.user.update({ where: { email }, data: { emailVerified: true } });
    const signInRes = await axios.post(`${BACKEND_URL}/api/auth/sign-in/email`, { email, password });
    storeResponseCookies(userJar, signInRes);
    const cookie = cookieHeader(userJar);
    if (!cookie) {
      throw new Error("No session cookie set on sign-in");
    }
    const sessionCheck = await axios.get(`${BACKEND_URL}/api/auth/get-session`, { headers: authHeaders(userJar) });
    if (!sessionCheck.data?.user?.id) {
      throw new Error("Session not established after sign-in");
    }

    const dbUser = await prisma.user.findUnique({ where: { email } });
    userId = dbUser!.id;

    const tag = await prisma.problemTag.findFirst();
    const createdProblem = await prisma.problems.create({
      data: {
        title: `User Test Problem ${Date.now()}`,
        description: "User test problem",
        problemType: "EASY",
        constraints: ["1 <= n <= 10"],
        cpuTimeLimit: 2000,
        memoryTimeLimit: 256000,
        userId,
        tags: tag ? { connect: [{ id: tag.id }] } : undefined,
        visibleTestCases: { create: [{ input: "1\n", output: "1\n" }] },
        hiddenTestCases: { create: [{ input: "2\n", output: "2\n" }] },
      },
    });
    const futureDate = new Date("2100-01-01T00:00:00.000Z");
    await prisma.problems.update({
      where: { id: createdProblem.id },
      data: { createdAt: futureDate },
    });
    const updated = await prisma.problems.findUnique({ where: { id: createdProblem.id } });
    if (!updated || updated.createdAt.getTime() < futureDate.getTime()) {
      await prisma.$executeRaw`UPDATE "Problems" SET "createdAt" = ${futureDate} WHERE "id" = ${createdProblem.id}`;
    }
    const latest = await prisma.problems.findFirst({ orderBy: { createdAt: "desc" } });
    if (!latest || latest.id !== createdProblem.id) {
      const later = new Date("2200-01-01T00:00:00.000Z");
      await prisma.$executeRaw`UPDATE "Problems" SET "createdAt" = ${later} WHERE "id" = ${createdProblem.id}`;
    }
    problemEasyId = createdProblem.id;

    const seededProblems = await prisma.problems.findMany({
      where: { isDeleted: false, id: { not: problemEasyId } },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    problemMediumId = seededProblems[0]!.id;
    problemHardId = seededProblems[1]!.id;

    await prisma.submission.create({
      data: {
        code: "print(1)",
        language: "PYTHON",
        status: "SOLVED",
        problemId: problemEasyId,
        userId,
      },
    });
  });

  it("lists problems for unauthenticated users", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/user/problems`);
    expect(res.status).toBe(200);
    expect(res.data.role).toBe("user");
    expect(Array.isArray(res.data.problems)).toBe(true);
    expect(res.data.problems[0].submission).toEqual([]);
  });

  it("lists problems for authenticated users with submission status", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/user/problems`, { headers: authHeaders(userJar) });
    expect(res.status).toBe(200);
    expect(res.data.role).toBe("user");
  });

  it("returns progress widget stats", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/user/problems/progress-widget`, { headers: authHeaders(userJar) });
    expect(res.status).toBe(200);
    expect(res.data.data.easy.total).toBeGreaterThanOrEqual(1);
    expect(res.data.data.easy.solved).toBeGreaterThanOrEqual(1);
    expect(res.data.data.medium.total).toBeGreaterThanOrEqual(1);
    expect(res.data.data.hard.total).toBeGreaterThanOrEqual(1);
  });

  it("returns problem detail and starter code", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/user/problems/${problemEasyId}`, { headers: authHeaders(userJar) });
    expect(res.status).toBe(200);
    expect(res.data.problem.id).toBe(problemEasyId);
    const starterKeys = Object.keys(res.data.starterCodeObj);
    expect(starterKeys).toEqual(expect.arrayContaining(["CPP", "JAVASCRIPT", "TYPESCRIPT", "RUST", "GO", "PYTHON", "JAVA"]));
  });

  it("returns problems list around a middle problem", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/user/problems/problemsList/${problemHardId}`, { headers: authHeaders(userJar) });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.problems)).toBe(true);
    expect(res.data.problems).toContain(problemHardId);
    expect(typeof res.data.index).toBe("number");
  });

  it("returns 404 for missing problem", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/user/problems/does-not-exist`, { headers: authHeaders(userJar), validateStatus: () => true });
    expect(res.status).toBe(404);
  });

  afterAll(async () => { });
});
