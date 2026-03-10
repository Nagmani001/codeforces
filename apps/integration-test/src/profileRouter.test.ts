import { describe, expect, it } from "vitest";
import axios from "axios";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe("Profile uploadthing endpoint", () => {
  it("responds with a client error for empty upload request", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/profile/api/uploadthing`, {}, { validateStatus: () => true });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});
