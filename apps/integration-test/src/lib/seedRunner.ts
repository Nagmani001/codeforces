import { seedDatabase } from "@repo/database/seed";
import prisma from "@repo/database/client";
import { promises as fs } from "fs";

const LOCK_FILE = "/tmp/codeforces-integration-seed.lock";
const DONE_FILE = "/tmp/codeforces-integration-seed.done";

async function fileExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function acquireLock() {
  while (true) {
    try {
      const handle = await fs.open(LOCK_FILE, "wx");
      return handle;
    } catch (err: any) {
      if (err?.code !== "EEXIST") throw err;
      await new Promise((r) => setTimeout(r, 250));
    }
  }
}

async function needsSeed() {
  try {
    const [admin, problemsCount, starterCount] = await Promise.all([
      prisma.user.findUnique({ where: { email: "nagmanipd3@gmail.com" } }),
      prisma.problems.count(),
      prisma.starterCode.count(),
    ]);
    return !admin || problemsCount === 0 || starterCount === 0;
  } catch {
    return true;
  }
}

export async function runSeedOnce() {
  if ((await fileExists(DONE_FILE)) && !(await needsSeed())) return;

  const lockHandle = await acquireLock();
  try {
    if ((await fileExists(DONE_FILE)) && !(await needsSeed())) return;
    await seedDatabase();
    await fs.writeFile(DONE_FILE, String(Date.now()));
  } finally {
    await lockHandle.close().catch(() => {});
    await fs.unlink(LOCK_FILE).catch(() => {});
  }
}
