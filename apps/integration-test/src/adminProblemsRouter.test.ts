import { describe, expect, it, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { createCookieJar, storeResponseCookies, authHeaders } from "./lib/cookies";
import { prisma } from "./lib/db";
import { runSeedOnce } from "./lib/seedRunner";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe.sequential("Admin problems API", () => {
  const adminJar = createCookieJar();
  const adminEmail = "nagmanipd3@gmail.com";
  const adminPassword = "nagmaniupadhyay";
  let problemId: string;
  const tagTitle = "Array";

  beforeAll(async () => {
    await runSeedOnce();
    const signInRes = await axios.post(`${BACKEND_URL}/api/auth/sign-in/email`, {
      email: adminEmail,
      password: adminPassword,
    });
    storeResponseCookies(adminJar, signInRes);
  });

  it("creates a problem", async () => {
    const uniqueTitle = `Two Sum ${Date.now()}`;
    const res = await axios.post(
      `${BACKEND_URL}/api/admin/problems/createProblem`,
      {
      title: uniqueTitle,
      problemType: "EASY",
      tags: [{ title: tagTitle, fixed: false }],
      constraints: ["1 <= n <= 10"],
      description: "Given an array, find two sum.",
      cpuTimeLimit: 2000,
      memoryTimeLimit: 256000,
      visibleTestCases: [{ input: "1 2\n", output: "3\n" }],
      hiddenTestCases: [{ input: "2 2\n", output: "4\n" }],
      },
      { headers: authHeaders(adminJar) },
    );
    expect(res.status).toBe(201);
    expect(res.data.message).toBe("problem created");

    const created = await prisma.problems.findFirst({ where: { title: uniqueTitle } });
    expect(created).toBeTruthy();
    problemId = created!.id;
  });

  it("lists problems for admin", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/admin/problems`, { params: { page: 1 }, headers: authHeaders(adminJar) });
    expect(res.status).toBe(200);
    expect(res.data.role).toBe("admin");
    expect(Array.isArray(res.data.problems)).toBe(true);
  });

  it("updates a problem", async () => {
    const res = await axios.put(
      `${BACKEND_URL}/api/admin/problems/updateProblem/${problemId}`,
      {
      title: "Two Sum Updated",
      description: "Updated description",
      cpuTimeLimit: 1500,
      },
      { headers: authHeaders(adminJar) },
    );
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("update problem");

    const updated = await prisma.problems.findUnique({ where: { id: problemId } });
    expect(updated?.title).toBe("Two Sum Updated");
  });

  it("deletes a problem (soft delete)", async () => {
    const res = await axios.delete(`${BACKEND_URL}/api/admin/problems/deleteProblem/${problemId}`, { headers: authHeaders(adminJar) });
    expect(res.status).toBe(200);
    expect(res.data.message).toBe("deleted problem");

    const deleted = await prisma.problems.findUnique({ where: { id: problemId } });
    expect(deleted?.isDeleted).toBe(true);
  });

  it("rejects non-admin access", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/admin/problems`, { params: { page: 1 }, validateStatus: () => true });
    expect(res.status).toBe(403);
    expect(res.data.message).toBe("unauthorized");
  });

  afterAll(async () => {});
});
