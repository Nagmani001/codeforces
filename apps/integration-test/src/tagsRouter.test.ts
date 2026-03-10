import { describe, expect, it, beforeAll, afterAll } from "vitest";
import axios from "axios";
import { runSeedOnce } from "./lib/seedRunner";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

describe.sequential("Tags API", () => {
  let tagId: string;
  const tagTitle = `math-${Date.now()}`;

  beforeAll(async () => {
    await runSeedOnce();
  });

  it("creates a tag", async () => {
    const res = await axios.post(`${BACKEND_URL}/api/tags/createTag`, { tag: tagTitle });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });

  it("lists tags", async () => {
    const res = await axios.get(`${BACKEND_URL}/api/tags/getAll`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data.allTags)).toBe(true);
    const tag = res.data.allTags.find((t: any) => t.title === tagTitle);
    expect(tag).toBeTruthy();
    tagId = tag.id;
  });

  it("updates a tag", async () => {
    const res = await axios.put(`${BACKEND_URL}/api/tags/updateTag/${tagId}`, { tag: `${tagTitle}-updated` });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });

  it("deletes a tag", async () => {
    const res = await axios.delete(`${BACKEND_URL}/api/tags/deleteTag/${tagId}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });

  afterAll(async () => {});
});
