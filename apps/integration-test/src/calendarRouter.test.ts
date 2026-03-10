import { describe, expect, it, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { createCookieJar, storeResponseCookies, authHeaders } from "./lib/cookies";
import { prisma } from "./lib/db";
import { runSeedOnce } from "./lib/seedRunner";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe.sequential("calendarRouter", () => {
  const userJar = createCookieJar();
  const email = `calendar.${Date.now()}@example.com`;
  const password = "CalendarPassword123!";
  let userId: string;

  beforeAll(async () => {
    await runSeedOnce();

    await axios.post(`${BACKEND_URL}/api/auth/sign-up/email`, { name: "Calendar User", email, password });
    await prisma.user.update({ where: { email }, data: { emailVerified: true } });
    const signInRes = await axios.post(`${BACKEND_URL}/api/auth/sign-in/email`, { email, password });
    storeResponseCookies(userJar, signInRes);

    const dbUser = await prisma.user.findUnique({ where: { email } });
    userId = dbUser!.id;

    const date = new Date(Date.UTC(2026, 2, 10)); // March 10, 2026
    await prisma.calendar.create({
      data: { userId, date },
    });
  });

  it("returns calendar entries for a month", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/calendar/month`, {
      params: { year: 2026, month: 3 },
      headers: authHeaders(userJar),
    });
    expect(res.status).toBe(200);
    expect(res.data.submittedDays).toContain(10);
  });

  it("rejects invalid month params", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/calendar/month`, {
      params: { year: 2026, month: 13 },
      headers: authHeaders(userJar),
      validateStatus: () => true,
    });
    expect(res.status).toBe(400);
  });

  afterAll(async () => {});
});
