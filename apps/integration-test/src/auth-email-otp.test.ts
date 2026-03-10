import { describe, expect, it, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { createCookieJar, storeResponseCookies, authHeaders } from "./lib/cookies";
import { createMailhogClient, extractOtpFromMessage, extractRecipients } from "./lib/mailhog";
import { runSeedOnce } from "./lib/seedRunner";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe.sequential("Auth email OTP flow", () => {
  const jar = createCookieJar();
  const mailhog = createMailhogClient();
  const email = `otp.user.${Date.now()}@example.com`;
  let otpValue = "";

  beforeAll(async () => {
    await runSeedOnce();
    await mailhog.clear();
    jar.clear();
  });

  it("sends OTP and delivers email via MailHog", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/auth/email-otp/send-verification-otp`, {
      email,
      type: "sign-in",
    });
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ success: true });

    const message = await mailhog.waitForMessage((msg) => {
      return extractRecipients(msg).some((addr) => addr.includes(email));
    });
    const otp = extractOtpFromMessage(message);
    expect(otp).toMatch(/^\d{6}$/);
    otpValue = otp!;
  });

  it("can fetch and verify OTP, then sign in", async () => {
    const signInRes = await axios.post(`${BACKEND_URL}/api/auth/sign-in/email-otp`, {
      email,
      otp: otpValue,
    });
    expect(signInRes.status).toBe(200);
    expect(signInRes.data).toHaveProperty("token");
    expect(signInRes.data).toHaveProperty("user");
    storeResponseCookies(jar, signInRes);

    const sessionRes = await axios.get(`${BACKEND_URL}/api/auth/get-session`, { headers: authHeaders(jar) });
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.data?.user?.email).toBe(email);
  });

  it("signs out and clears session", async () => {
    const signOutRes = await axios.post(`${BACKEND_URL}/api/auth/sign-out`, {}, { headers: authHeaders(jar) });
    expect(signOutRes.status).toBe(200);
    storeResponseCookies(jar, signOutRes);
    jar.clear();

    const sessionRes = await axios.get(`${BACKEND_URL}/api/auth/get-session`, { headers: authHeaders(jar) });
    expect(sessionRes.status).toBe(200);
    expect(sessionRes.data).toBeNull();
  });

  it("responds with unauthorized on protected endpoint when signed out", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/submissions`, { params: { problemId: "missing" }, headers: authHeaders(jar), validateStatus: () => true });
    expect(res.status).toBe(403);
    expect(res.data).toEqual({ message: "unauthorized" });
  });

  afterAll(async () => {});
});
