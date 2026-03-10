import { describe, expect, it } from "vitest";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe("Health + /api/me", () => {
  it("GET /health returns ok", async () => {
    const res = await axios.get(`${BACKEND_URL}/health`);
    expect(res.status).toBe(200);
    expect(res.data).toBe("ok");
  });

  it("GET /api/me returns null session when unauthenticated", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/me`);
    expect(res.status).toBe(200);
    expect(res.data).toBeNull();
  });
});
