import { describe, expect, it, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { createCookieJar, storeResponseCookies, authHeaders } from "./lib/cookies";
import { createMailhogClient, extractResetTokenFromMessage, extractRecipients } from "./lib/mailhog";
import { prisma } from "./lib/db";
import { runSeedOnce } from "./lib/seedRunner";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe.sequential("Auth email/password + reset password", () => {
  const mailhog = createMailhogClient();
  const jar = createCookieJar();

  const email = `password.user.${Date.now()}@example.com`;
  const password = "Password123!";
  const newPassword = "NewPassword123!";

  beforeAll(async () => {
    await runSeedOnce();
    await mailhog.clear();
    jar.clear();
  });

  it("signs up with email/password", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/auth/sign-up/email`, {
      name: "Password User",
      email,
      password,
    });
    expect(res.status).toBe(200);
    expect(res.data.user?.email).toBe(email);
    expect(res.data.token).toBeNull();
  });

  it("marks email verified and signs in with email/password", async () => {
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    const res = await axios.post(`${BACKEND_URL}/api/auth/sign-in/email`, {
      email,
      password,
    });
    expect(res.status).toBe(200);
    expect(res.data.user?.email).toBe(email);
    storeResponseCookies(jar, res);
  });

  it("lists and revokes sessions", async () => {
    const listRes = await axios.get(`${BACKEND_URL}/api/auth/list-sessions`, { headers: authHeaders(jar) });
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.data)).toBe(true);
    expect(listRes.data.length).toBeGreaterThan(0);

    const token = listRes.data[0].token;
    const revokeRes = await axios.post(`${BACKEND_URL}/api/auth/revoke-session`, { token }, { headers: authHeaders(jar) });
    expect(revokeRes.status).toBe(200);
    expect(revokeRes.data).toEqual({ status: true });
  });

  it("requests password reset and receives email in MailHog", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/auth/request-password-reset`, {
      email,
      redirectTo: "http://localhost:3000/reset",
    });
    expect(res.status).toBe(200);

    const message = await mailhog.waitForMessage((msg) => {
      return extractRecipients(msg).some((addr) => addr.includes(email));
    });
    const token = extractResetTokenFromMessage(message);
    expect(token).toBeTruthy();
  });

  it("resets password using token", async () => {
    const verification = await prisma.verification.findFirst({
      where: { identifier: { startsWith: "reset-password:" } },
      orderBy: { createdAt: "desc" },
    });
    const token = verification?.identifier.replace("reset-password:", "");
    expect(token).toBeTruthy();

    const res = await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
      newPassword,
      token: token!,
    });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ status: true });
  });

  afterAll(async () => {});
});
