import { describe, expect, it } from "vitest";
import axios from "./lib/utils";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe("GET /", () => {
  it("should check the health endpoint and return healthy", async () => {
    const response = await axios.get(`${BACKEND_URL}/health`);
    expect(response.status).toBe(200);
    expect(response.data).toStrictEqual({
      message: "healthy",
    });
  });

});
