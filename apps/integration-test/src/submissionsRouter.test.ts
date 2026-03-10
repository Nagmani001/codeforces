import { describe, expect, it, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { createCookieJar, storeResponseCookies, authHeaders } from "./lib/cookies";
import { prisma } from "./lib/db";
import { runSeedOnce } from "./lib/seedRunner";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const LANGUAGES = ["CPP", "JAVASCRIPT", "TYPESCRIPT", "RUST", "GO", "PYTHON", "JAVA"] as const;

describe.sequential("submissionsRouter", () => {
  const userJar = createCookieJar();
  const email = `submissions.${Date.now()}@example.com`;
  const password = "SubmissionsPassword123!";

  let userId: string;
  let problemId: string;

  beforeAll(async () => {
    await runSeedOnce();

    await axios.post(`${BACKEND_URL}/api/auth/sign-up/email`, { name: "Submission User", email, password });
    await prisma.user.update({ where: { email }, data: { emailVerified: true } });
    const signInRes = await axios.post(`${BACKEND_URL}/api/auth/sign-in/email`, { email, password });
    storeResponseCookies(userJar, signInRes);

    const dbUser = await prisma.user.findUnique({ where: { email } });
    userId = dbUser!.id;

    const problem = await prisma.problems.findFirst({ where: { isDeleted: false } });
    problemId = problem!.id;

    for (const language of LANGUAGES) {
      await prisma.submission.create({
        data: {
          code: `// ${language} solution`,
          language,
          status: "ATTEMPTED",
          problemId,
          userId,
        },
      });
    }
  });

  it("lists submissions for a problem across all languages", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/submissions`, {
      params: { problemId },
      headers: authHeaders(userJar),
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.submissions)).toBe(true);
    const langs = res.data.submissions.map((s: any) => s.language);
    for (const lang of LANGUAGES) {
      expect(langs).toContain(lang);
    }
  });

  afterAll(async () => {});
});
