import { describe, expect, it, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { createCookieJar, storeResponseCookies, authHeaders } from "./lib/cookies";
import { prisma } from "./lib/db";
import { runSeedOnce } from "./lib/seedRunner";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe.sequential("Execution endpoints", () => {
  const userJar = createCookieJar();
  const email = `execute.${Date.now()}@example.com`;
  const password = "ExecutePassword123!";

  beforeAll(async () => {
    await runSeedOnce();
    await axios.post(`${BACKEND_URL}/api/auth/sign-up/email`, { name: "Exec User", email, password });
    await prisma.user.update({ where: { email }, data: { emailVerified: true } });
    const signInRes = await axios.post(`${BACKEND_URL}/api/auth/sign-in/email`, { email, password });
    storeResponseCookies(userJar, signInRes);
  });

  it("rejects unauthenticated stream access", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/execute/stream/does-not-exist`, { validateStatus: () => true });
    expect(res.status).toBe(403);
    expect(res.data.message).toBe("unauthorized");
  });

  it("validates execute payload for authenticated users", async () => {
    const res = await axios.post(
      `${BACKEND_URL}/api/execute/execute`,
      { bad: "payload" },
      { headers: authHeaders(userJar), validateStatus: () => true },
    );
    expect(res.status).toBe(400);
    expect(res.data.message).toBe("invali inputs");
  });

  it("validates submission polling params", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/execute/submission`, { headers: authHeaders(userJar), validateStatus: () => true });
    expect(res.status).toBe(400);
    expect(res.data.message).toBe("invali inputs");
  });

  afterAll(async () => {});
});
