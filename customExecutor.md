# Custom Code Executor with Isolate — Detailed Implementation Plan

## What Exists Today

| Component | Status | Details |
|-----------|--------|---------|
| **Redis** | Running | `docker/docker-compose.yml` — port 6379, healthy |
| **Backend Redis client** | Commented out | `apps/backend/src/redis/client.ts` — `redisClient` + `pubSubClient` |
| **Worker Redis client** | Commented out | `apps/worker/src/redis/client.ts` — same pattern |
| **Worker entry** | Commented out | `apps/worker/src/index.ts` — `brPop(FIRE_CRACKER_QUEUE)` loop |
| **Queue constant** | Exists | `packages/common/src/consts.ts` — `FIRE_CRACKER_QUEUE` |
| **Firecracker router** | Commented out | `apps/backend/src/router/firecrackerRouter.ts` — pubsub pattern |
| **Judge0 router** | Active | `apps/backend/src/router/judge0Router.ts` — batch + polling |
| **Frontend polling** | Active | `arena-layout.tsx` — 1.3s `setInterval` polling Judge0 |
| **Submission model** | Active | Prisma — `resultVerdict`, `status`, `code`, `language` |
| **Test cases** | Active | `VisibleTestCases` + `HiddenTestCases` tables |

---

## Architecture: What Changes

```
BEFORE (Judge0):                          AFTER (Isolate):
──────────────────                        ────────────────
Frontend                                  Frontend
  ↓ POST /judge0/execute                    ↓ POST /execute
Backend                                   Backend
  ↓ HTTP → Judge0 batch API                 ↓ lPush → Redis queue
Judge0 (runs all tests in parallel)       Worker VM
  ↑ Frontend polls every 1.3s               ↓ brPop from queue
                                            ↓ isolate --init
                                            ↓ Compile ONCE
                                            ↓ Run test 1 → pass? → test 2 → ... → fail? STOP
                                            ↓ Publish result via Redis PubSub
                                          Backend (SSE endpoint)
                                            ↑ subscribes to PubSub channel
                                          Frontend (EventSource)
                                            ↑ receives real-time updates, no polling
```

---

## VM Setup (One-Time)

The worker runs directly on a Linux VM (not inside Docker). This VM needs:

### Install Isolate

```bash
# Dependencies
sudo apt-get update
sudo apt-get install -y build-essential libcap-dev

# Clone and build
git clone https://github.com/ioi/isolate.git
cd isolate
make
sudo make install

# Verify — should print the box path
isolate --box-id=0 --init
isolate --box-id=0 --cleanup
```

Isolate installs as a setuid binary at `/usr/local/bin/isolate`. It uses cgroups v2 by default on modern kernels.

### Install Compilers/Runtimes

```bash
# C++ (g++ 12+)
sudo apt-get install -y g++

# Python 3
sudo apt-get install -y python3

# Java (OpenJDK 17+)
sudo apt-get install -y default-jdk

# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Go
sudo apt-get install -y golang-go

# Node.js (for JS/TS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# TypeScript compiler
sudo npm install -g typescript
```

### Install Redis CLI (for testing)

```bash
sudo apt-get install -y redis-tools
```

### Verify Isolate Works

```bash
# Create box, write a simple program, compile, run, cleanup
isolate --box-id=0 --init
echo '#include <iostream>
int main() { int a, b; std::cin >> a >> b; std::cout << a + b; }' > /var/local/lib/isolate/0/box/solution.cpp

isolate --box-id=0 --run --time=5 --wall-time=10 --mem=262144 \
  -- /usr/bin/g++ -O2 -std=c++17 -o solution solution.cpp

echo "3 5" > /var/local/lib/isolate/0/box/input.txt

isolate --box-id=0 --run --time=2 --wall-time=5 --mem=262144 \
  --stdin=input.txt --stdout=output.txt --meta=/tmp/meta.txt \
  -- ./solution

cat /var/local/lib/isolate/0/box/output.txt  # Should print: 8
cat /tmp/meta.txt  # Shows time, memory, exit info

isolate --box-id=0 --cleanup
```

---

## Step-by-Step Implementation

### Step 1: Update `packages/common`

#### 1a. Rename queue constant

**File: `packages/common/src/consts.ts`**

```typescript
// Old:
export const FIRE_CRACKER_QUEUE = "firecracker_queue";

// New:
export const SUBMISSION_QUEUE = "submission_queue";
```

#### 1b. Add shared types

**File: `packages/common/src/types.ts`** (NEW)

```typescript
export type Language = "CPP" | "RUST" | "JAVASCRIPT" | "PYTHON" | "GO" | "TYPESCRIPT" | "JAVA";

export type SubmissionJob = {
  submissionId: string;
  code: string;
  language: Language;
  problemId: string;
  cpuTimeLimit: number;      // seconds (from problem.cpuTimeLimit)
  memoryLimit: number;        // KB (from problem.memoryTimeLimit, rename later)
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
  }[];
  type: "run" | "submit";
  userId: string;
};

export type Verdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR";

// Events published via Redis PubSub during execution
export type SubmissionEvent =
  | { type: "compiling" }
  | { type: "running"; currentTest: number; totalTests: number }
  | { type: "test_result"; testNumber: number; verdict: "ACCEPTED"; cpuTime: number; memoryUsed: number }
  | { type: "done"; verdict: Verdict; failedTest: number | null; maxCpuTime: number; maxMemoryUsed: number; message?: string }
  | { type: "error"; message: string };
```

---

### Step 2: Schema Changes

**File: `packages/database/prisma/schema.prisma`**

Add fields to `Submission`:

```prisma
model Submission {
  id                    String         @id @default(uuid())
  code                  String?
  language              Language       @default(CPP)
  status                ProblemStatus  @default(UNSOLVED)
  resultVerdict         ResultVerdict?
  failedTestCaseNumber  Int?           // Which test failed (1-indexed), null if ACCEPTED
  maxCpuTime            Int?           // Max CPU time across all test cases (ms)
  maxMemoryUsed         Int?           // Max memory across all test cases (KB)
  compilationError      String?        // stderr from compilation
  totalTestCases        Int?           // How many test cases were run against
  createdAt             DateTime       @default(now())
  problemId             String
  problem               Problems       @relation(fields: [problemId], references: [id], onDelete: Cascade)
  userId                String
  user                  User           @relation(fields: [userId], references: [id])
}
```

Then run:

```bash
cd packages/database
npx prisma migrate dev --name add_submission_details
```

---

### Step 3: Worker — Sandbox Module

#### 3a. Sandbox interface

**File: `apps/worker/src/sandbox/interface.ts`** (NEW)

```typescript
export type ExecResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
  cpuTime: number;      // milliseconds
  wallTime: number;      // milliseconds
  memoryUsed: number;    // KB
  signal?: string;       // SIGKILL, SIGSEGV, etc.
  status: "ok" | "tle" | "mle" | "runtime_error";
};

export type ExecOptions = {
  stdin?: string;
  timeLimit: number;     // seconds (wall time)
  cpuTimeLimit: number;  // seconds (CPU time)
  memoryLimit: number;   // KB
};

export interface Sandbox {
  init(): Promise<void>;
  writeFile(filename: string, content: string): Promise<void>;
  exec(cmd: string, args: string[], opts: ExecOptions): Promise<ExecResult>;
  destroy(): Promise<void>;
}
```

#### 3b. Isolate implementation

**File: `apps/worker/src/sandbox/isolate.ts`** (NEW)

This is the core of the entire system. Here's exactly what it does:

```typescript
import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile as fsWriteFile, readFile, mkdir } from "fs/promises";
import path from "path";
import type { Sandbox, ExecResult, ExecOptions } from "./interface";

const execFileAsync = promisify(execFile);

// Pool of box IDs to prevent conflicts between concurrent submissions
let nextBoxId = 0;
function getNextBoxId(): number {
  const id = nextBoxId;
  nextBoxId = (nextBoxId + 1) % 1000;  // isolate supports 0-999
  return id;
}

export class IsolateSandbox implements Sandbox {
  private boxId: number;
  private boxPath: string = "";

  constructor() {
    this.boxId = getNextBoxId();
  }

  async init(): Promise<void> {
    // `isolate --init` creates the sandbox directory and returns its path
    const { stdout } = await execFileAsync("isolate", [
      `--box-id=${this.boxId}`,
      "--cg",      // enable cgroups for memory tracking
      "--init",
    ]);
    this.boxPath = path.join(stdout.trim(), "box");
  }

  async writeFile(filename: string, content: string): Promise<void> {
    const filePath = path.join(this.boxPath, filename);
    const dir = path.dirname(filePath);
    await mkdir(dir, { recursive: true });
    await fsWriteFile(filePath, content, "utf-8");
  }

  async exec(cmd: string, args: string[], opts: ExecOptions): Promise<ExecResult> {
    const metaFile = `/tmp/isolate-meta-${this.boxId}.txt`;

    // Write stdin to a file inside the box if provided
    if (opts.stdin !== undefined) {
      await this.writeFile("_stdin.txt", opts.stdin);
    }

    const isolateArgs = [
      `--box-id=${this.boxId}`,
      "--cg",
      `--time=${opts.cpuTimeLimit}`,
      `--wall-time=${opts.timeLimit}`,
      `--cg-mem=${opts.memoryLimit}`,     // cgroup memory limit in KB
      `--mem=${opts.memoryLimit}`,         // address space limit in KB
      "--processes=64",                    // fork bomb protection
      "--fsize=65536",                     // max output file size: 64MB
      `--meta=${metaFile}`,
      "--stdout=_stdout.txt",
      "--stderr=_stderr.txt",
    ];

    if (opts.stdin !== undefined) {
      isolateArgs.push("--stdin=_stdin.txt");
    }

    // Add environment for compiled languages that need it
    isolateArgs.push(
      "--env=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "--env=HOME=/box",
    );

    isolateArgs.push("--run", "--", cmd, ...args);

    let exitCode = 0;
    try {
      await execFileAsync("isolate", isolateArgs, {
        timeout: (opts.timeLimit + 5) * 1000,  // hard kill 5s after wall limit
      });
    } catch (err: any) {
      // isolate returns non-zero when the sandboxed program fails
      // This is expected for WA/RE/TLE — we read the meta file for details
      exitCode = err.code ?? 1;
    }

    // Parse meta file — isolate writes key:value pairs
    const meta = await this.parseMeta(metaFile);

    // Read stdout and stderr from the box
    let stdout = "";
    let stderr = "";
    try {
      stdout = await readFile(path.join(this.boxPath, "_stdout.txt"), "utf-8");
    } catch {}
    try {
      stderr = await readFile(path.join(this.boxPath, "_stderr.txt"), "utf-8");
    } catch {}

    // Determine status from meta
    let status: ExecResult["status"] = "ok";
    const metaStatus = meta["status"] || "";
    const metaExitCode = parseInt(meta["exitcode"] || "0", 10);

    if (metaStatus === "TO") {
      status = "tle";     // time out (CPU or wall)
    } else if (metaStatus === "SG") {
      // Killed by signal
      const signal = meta["exitsig"] || "";
      if (signal === "9") {
        // SIGKILL — usually memory limit
        status = "mle";
      } else {
        status = "runtime_error";
      }
    } else if (metaStatus === "RE") {
      status = "runtime_error";
    } else if (metaStatus === "XX") {
      status = "runtime_error";  // internal error in isolate
    } else if (metaExitCode !== 0) {
      status = "runtime_error";
    }

    // Check if cg-oom-killed flag is set
    if (meta["cg-oom-killed"] === "1") {
      status = "mle";
    }

    return {
      exitCode: metaExitCode,
      stdout,
      stderr,
      cpuTime: Math.round(parseFloat(meta["time"] || "0") * 1000),       // seconds → ms
      wallTime: Math.round(parseFloat(meta["time-wall"] || "0") * 1000),
      memoryUsed: parseInt(meta["cg-mem"] || meta["max-rss"] || "0", 10), // KB
      signal: meta["exitsig"],
      status,
    };
  }

  async destroy(): Promise<void> {
    try {
      await execFileAsync("isolate", [
        `--box-id=${this.boxId}`,
        "--cg",
        "--cleanup",
      ]);
    } catch {
      // cleanup failure is non-fatal
    }
  }

  private async parseMeta(metaFile: string): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    try {
      const content = await readFile(metaFile, "utf-8");
      for (const line of content.split("\n")) {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          result[line.substring(0, colonIdx)] = line.substring(colonIdx + 1);
        }
      }
    } catch {}
    return result;
  }
}
```

**What the meta file looks like** (for reference):

```
time:0.004
time-wall:0.050
max-rss:3048
cg-mem:5120
exitcode:0
```

Or on failure:

```
time:2.001
time-wall:2.050
status:TO
message:Time limit exceeded
```

---

### Step 4: Worker — Language Configs

**File: `apps/worker/src/languages.ts`** (NEW)

```typescript
import type { Language } from "@repo/common/types";

type LanguageConfig = {
  sourceFile: string;
  compileCmd: { cmd: string; args: string[] } | null;
  runCmd: { cmd: string; args: string[] };
};

export const LANGUAGE_CONFIG: Record<Language, LanguageConfig> = {
  CPP: {
    sourceFile: "solution.cpp",
    compileCmd: {
      cmd: "/usr/bin/g++",
      args: ["-O2", "-std=c++17", "-o", "solution", "solution.cpp", "-lm"],
    },
    runCmd: { cmd: "./solution", args: [] },
  },
  PYTHON: {
    sourceFile: "solution.py",
    compileCmd: null,
    runCmd: { cmd: "/usr/bin/python3", args: ["solution.py"] },
  },
  JAVA: {
    sourceFile: "Main.java",
    compileCmd: {
      cmd: "/usr/bin/javac",
      args: ["Main.java"],
    },
    runCmd: { cmd: "/usr/bin/java", args: ["-Xmx256m", "Main"] },
  },
  RUST: {
    sourceFile: "solution.rs",
    compileCmd: {
      cmd: "/usr/bin/rustc",
      args: ["-O", "-o", "solution", "solution.rs"],
    },
    runCmd: { cmd: "./solution", args: [] },
  },
  GO: {
    sourceFile: "solution.go",
    compileCmd: {
      cmd: "/usr/bin/go",
      args: ["build", "-o", "solution", "solution.go"],
    },
    runCmd: { cmd: "./solution", args: [] },
  },
  JAVASCRIPT: {
    sourceFile: "solution.js",
    compileCmd: null,
    runCmd: { cmd: "/usr/bin/node", args: ["solution.js"] },
  },
  TYPESCRIPT: {
    sourceFile: "solution.ts",
    compileCmd: {
      cmd: "/usr/bin/npx",
      args: ["tsc", "solution.ts", "--outDir", "."],
    },
    runCmd: { cmd: "/usr/bin/node", args: ["solution.js"] },
  },
};
```

---

### Step 5: Worker — Executor (The Core Logic)

**File: `apps/worker/src/executor.ts`** (NEW)

```typescript
import { IsolateSandbox } from "./sandbox/isolate";
import { LANGUAGE_CONFIG } from "./languages";
import type { SubmissionJob, SubmissionEvent, Verdict } from "@repo/common/types";
import type { RedisClientType } from "redis";

function normalizeOutput(s: string): string {
  return s.split("\n").map((l) => l.trimEnd()).join("\n").trimEnd();
}

export async function executeSubmission(
  job: SubmissionJob,
  pubSubClient: RedisClientType
): Promise<void> {
  const channel = `submission:${job.submissionId}`;
  const config = LANGUAGE_CONFIG[job.language];
  const sandbox = new IsolateSandbox();

  const publish = (event: SubmissionEvent) =>
    pubSubClient.publish(channel, JSON.stringify(event));

  try {
    await sandbox.init();

    // Write source code into the sandbox
    await sandbox.writeFile(config.sourceFile, job.code);

    // ── Phase 1: Compile ──────────────────────────────────────
    if (config.compileCmd) {
      await publish({ type: "compiling" });

      const compileResult = await sandbox.exec(
        config.compileCmd.cmd,
        config.compileCmd.args,
        {
          timeLimit: 30,
          cpuTimeLimit: 30,
          memoryLimit: 512 * 1024, // 512 MB for compilation
        }
      );

      if (compileResult.exitCode !== 0 || compileResult.status !== "ok") {
        await publish({
          type: "done",
          verdict: "COMPILATION_ERROR",
          failedTest: null,
          maxCpuTime: 0,
          maxMemoryUsed: 0,
          message: compileResult.stderr,
        });
        return;
      }
    }

    // ── Phase 2: Run test cases SEQUENTIALLY ──────────────────
    let maxCpuTime = 0;
    let maxMemoryUsed = 0;

    for (let i = 0; i < job.testCases.length; i++) {
      const tc = job.testCases[i];

      await publish({
        type: "running",
        currentTest: i + 1,
        totalTests: job.testCases.length,
      });

      const runResult = await sandbox.exec(
        config.runCmd.cmd,
        config.runCmd.args,
        {
          stdin: tc.input,
          timeLimit: job.cpuTimeLimit * 2,  // wall = 2x CPU (for I/O overhead)
          cpuTimeLimit: job.cpuTimeLimit,
          memoryLimit: job.memoryLimit,
        }
      );

      // Track maximums
      maxCpuTime = Math.max(maxCpuTime, runResult.cpuTime);
      maxMemoryUsed = Math.max(maxMemoryUsed, runResult.memoryUsed);

      // ── Check TLE ──
      if (runResult.status === "tle") {
        await publish({
          type: "done",
          verdict: "TIME_LIMIT_EXCEEDED",
          failedTest: i + 1,
          maxCpuTime,
          maxMemoryUsed,
        });
        return;
      }

      // ── Check MLE ──
      if (runResult.status === "mle") {
        await publish({
          type: "done",
          verdict: "MEMORY_LIMIT_EXCEEDED",
          failedTest: i + 1,
          maxCpuTime,
          maxMemoryUsed,
        });
        return;
      }

      // ── Check Runtime Error ──
      if (runResult.status === "runtime_error" || runResult.exitCode !== 0) {
        await publish({
          type: "done",
          verdict: "RUNTIME_ERROR",
          failedTest: i + 1,
          maxCpuTime,
          maxMemoryUsed,
          message: runResult.stderr,
        });
        return;
      }

      // ── Compare Output ──
      const actual = normalizeOutput(runResult.stdout);
      const expected = normalizeOutput(tc.expectedOutput);

      if (actual !== expected) {
        await publish({
          type: "done",
          verdict: "WRONG_ANSWER",
          failedTest: i + 1,
          maxCpuTime,
          maxMemoryUsed,
        });
        return;
      }

      // This test passed — emit progress
      await publish({
        type: "test_result",
        testNumber: i + 1,
        verdict: "ACCEPTED",
        cpuTime: runResult.cpuTime,
        memoryUsed: runResult.memoryUsed,
      });
    }

    // ── All tests passed ──
    await publish({
      type: "done",
      verdict: "ACCEPTED",
      failedTest: null,
      maxCpuTime,
      maxMemoryUsed,
    });
  } catch (err: any) {
    await publish({
      type: "error",
      message: err.message || "Internal executor error",
    });
  } finally {
    await sandbox.destroy();
  }
}
```

**Key design decisions:**
- `publish()` sends events to `submission:{submissionId}` channel — the backend SSE endpoint subscribes to this
- Early return on first failure — no wasted computation
- `maxCpuTime` and `maxMemoryUsed` track the worst case across all accepted tests
- `normalizeOutput()` trims trailing whitespace per line and trailing newlines (same as Codeforces behavior)

---

### Step 6: Worker — Entry Point

**File: `apps/worker/src/index.ts`** (REPLACE commented code)

```typescript
import { createClient, RedisClientType } from "redis";
import { SUBMISSION_QUEUE } from "@repo/common/consts";
import { executeSubmission } from "./executor";
import type { SubmissionJob } from "@repo/common/types";

const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "4", 10);

async function main() {
  // Two clients: one for queue ops, one for publishing events
  const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });
  const pubSubClient: RedisClientType = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  await redisClient.connect();
  await pubSubClient.connect();
  console.log("Worker connected to Redis");

  let activeJobs = 0;

  // Spin up CONCURRENCY number of consumer loops
  for (let i = 0; i < CONCURRENCY; i++) {
    consumeLoop(redisClient, pubSubClient, i);
  }
}

async function consumeLoop(
  redisClient: RedisClientType,
  pubSubClient: RedisClientType,
  workerId: number
) {
  console.log(`Consumer ${workerId} started`);

  while (true) {
    try {
      // brPop blocks until a job is available (timeout 0 = wait forever)
      const popped = await redisClient.brPop(SUBMISSION_QUEUE, 0);
      if (!popped) continue;

      const job: SubmissionJob = JSON.parse(popped.element);
      console.log(`Consumer ${workerId} processing submission ${job.submissionId}`);

      await executeSubmission(job, pubSubClient);

      console.log(`Consumer ${workerId} finished submission ${job.submissionId}`);
    } catch (err) {
      console.error(`Consumer ${workerId} error:`, err);
      // Don't crash the loop — continue picking up next job
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
```

**File: `apps/worker/src/redis/client.ts`** (REPLACE — keep for backward compat but simpler now)

```typescript
// Redis clients are created directly in index.ts
// This file kept for reference
```

---

### Step 7: Worker — `package.json` Updates

**File: `apps/worker/package.json`** — add `@repo/common` types dependency (already there) and ensure scripts work:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@repo/common": "workspace:*",
    "redis": "^5.10.0"
  },
  "devDependencies": {
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

---

### Step 8: Backend — New Execution Router

**File: `apps/backend/src/router/executionRouter.ts`** (NEW — replaces judge0Router)

```typescript
import { Router, Request, Response } from "express";
import { invalidInputs, unauthorized } from "../util/lib";
import prisma from "@repo/database/client";
import { submissionSchema } from "@repo/common/zodTypes";
import { auth } from "../util/auth";
import { fromNodeHeaders } from "better-auth/node";
import { redisClient, pubSubClient } from "../redis/client";
import { SUBMISSION_QUEUE } from "@repo/common/consts";
import type { SubmissionJob, SubmissionEvent } from "@repo/common/types";

export const executionRouter: Router = Router();

// ── POST /execute — Push job to queue, return submissionId ──
executionRouter.post("/execute", async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return unauthorized(res);

  const parsedData = submissionSchema.safeParse(req.body);
  if (!parsedData.success) return invalidInputs(res);

  const { problemId, code, language, type } = parsedData.data;

  // Fetch problem with test cases and limits
  const problem = await prisma.problems.findFirst({
    where: { id: problemId },
    select: {
      cpuTimeLimit: true,
      memoryTimeLimit: true,
      visibleTestCases: { select: { id: true, input: true, output: true } },
      hiddenTestCases: { select: { id: true, input: true, output: true } },
    },
  });

  if (!problem) {
    return res.status(404).json({ msg: "Problem not found" });
  }

  // Build test case list
  let testCases;
  if (type === "run") {
    testCases = problem.visibleTestCases.map((tc) => ({
      id: tc.id,
      input: tc.input,
      expectedOutput: tc.output,
    }));
  } else {
    // "submit" — hidden first, then visible (like Codeforces)
    testCases = [
      ...problem.hiddenTestCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.output,
      })),
      ...problem.visibleTestCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.output,
      })),
    ];
  }

  // Create submission record (for "submit" type)
  let submissionId: string;
  if (type === "submit") {
    const submission = await prisma.submission.create({
      data: {
        code,
        language,
        status: "ATTEMPTED",
        problemId,
        userId: session.user.id,
        totalTestCases: testCases.length,
      },
    });
    submissionId = submission.id;
  } else {
    // For "run", generate a temporary ID (not stored in DB)
    submissionId = `run-${crypto.randomUUID()}`;
  }

  // Build job and push to Redis queue
  const job: SubmissionJob = {
    submissionId,
    code,
    language: language as SubmissionJob["language"],
    problemId,
    cpuTimeLimit: problem.cpuTimeLimit,
    memoryLimit: problem.memoryTimeLimit,
    testCases,
    type,
    userId: session.user.id,
  };

  await redisClient.lPush(SUBMISSION_QUEUE, JSON.stringify(job));

  res.json({ submissionId });
});

// ── GET /stream/:submissionId — SSE endpoint for real-time updates ──
executionRouter.get("/stream/:submissionId", async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return unauthorized(res);

  const { submissionId } = req.params;
  const channel = `submission:${submissionId}`;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": req.headers.origin || "*",
    "Access-Control-Allow-Credentials": "true",
  });
  res.flushHeaders();

  // Create a dedicated subscriber client (Redis PubSub requires dedicated connection)
  const subscriber = pubSubClient.duplicate();
  await subscriber.connect();

  const onMessage = async (message: string) => {
    const event: SubmissionEvent = JSON.parse(message);

    // Send SSE event
    res.write(`data: ${message}\n\n`);

    // If final event, update DB and close
    if (event.type === "done" || event.type === "error") {
      // Update submission in DB (only for "submit" type, not "run")
      if (!submissionId.startsWith("run-") && event.type === "done") {
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            resultVerdict: event.verdict,
            status: event.verdict === "ACCEPTED" ? "SOLVED" : "ATTEMPTED",
            failedTestCaseNumber: event.failedTest,
            maxCpuTime: event.maxCpuTime,
            maxMemoryUsed: event.maxMemoryUsed,
            compilationError: event.verdict === "COMPILATION_ERROR" ? event.message : null,
          },
        });
      }

      // Cleanup
      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
      res.end();
    }
  };

  await subscriber.subscribe(channel, onMessage);

  // Handle client disconnect
  req.on("close", async () => {
    try {
      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
    } catch {}
  });

  // Safety timeout — close after 5 minutes if no result
  setTimeout(async () => {
    try {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Execution timed out" })}\n\n`);
      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
      res.end();
    } catch {}
  }, 5 * 60 * 1000);
});
```

---

### Step 9: Backend — Uncomment Redis, Wire New Router

**File: `apps/backend/src/redis/client.ts`** (UNCOMMENT + add URL)

```typescript
import { createClient, RedisClientType } from "redis";

export const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
export const pubSubClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
```

**File: `apps/backend/src/index.ts`** — Changes:

```typescript
// Add import
import { executionRouter } from "./router/executionRouter";
import { redisClient, pubSubClient } from "./redis/client";

// In main(), uncomment Redis connection:
async function main() {
  await redisClient.connect();
  console.log("connected to redis client");
  await pubSubClient.connect();
  console.log("connected to pub sub client");

  // ... rest of app setup ...

  // Replace judge0 route with new execution route
  // app.use("/api/judge0", judge0Router);        // ← REMOVE
  app.use("/api/execution", executionRouter);      // ← ADD

  // Keep judge0Router temporarily if you want a fallback during transition
}
```

---

### Step 10: Frontend — Replace Polling with SSE

**File: `apps/web/components/arena/arena-layout.tsx`** — Replace `handleRunFor`:

```typescript
async function handleRunFor(type: "submit" | "run") {
  setIsRunning(true);
  setActiveTab("result");

  // Reset test cases to pending state
  setTestCases(
    problem.testCases.map((tc) => ({ ...tc, status: "pending" as const, verdict: undefined }))
  );

  const submissionObj = { problemId: problem.id, code, language, type };

  try {
    // Step 1: Submit to backend — get submissionId
    const response = await axios.post(`${BASE_URL}/api/execution/execute`, submissionObj, {
      withCredentials: true,
    });
    const { submissionId } = response.data;

    // Step 2: Open SSE connection for real-time updates
    const eventSource = new EventSource(
      `${BASE_URL}/api/execution/stream/${submissionId}`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      const data: SubmissionEvent = JSON.parse(event.data);

      switch (data.type) {
        case "compiling":
          // Could show "Compiling..." in UI
          break;

        case "running":
          // Update UI: "Running test 5/100"
          // You could add a progress state for this
          break;

        case "test_result":
          // Mark individual test as passed (for "run" mode visible tests)
          if (type === "run") {
            setTestCases((prev) =>
              prev.map((tc, i) =>
                i === data.testNumber - 1
                  ? { ...tc, status: "passed" as const, verdict: "accepted" as const }
                  : tc
              )
            );
          }
          break;

        case "done":
          // Map verdict to frontend format
          const verdictMap: Record<string, TestCaseVerdict> = {
            ACCEPTED: "accepted",
            WRONG_ANSWER: "wrong_answer",
            TIME_LIMIT_EXCEEDED: "tle",
            MEMORY_LIMIT_EXCEEDED: "tle",  // or add new type
            RUNTIME_ERROR: "runtime_error",
            COMPILATION_ERROR: "compilation_error",
          };

          if (data.verdict === "ACCEPTED") {
            // All tests passed
            setTestCases((prev) =>
              prev.map((tc) => ({ ...tc, status: "passed" as const, verdict: "accepted" as const }))
            );
          } else if (data.failedTest !== null) {
            // Mark which test failed
            setTestCases((prev) =>
              prev.map((tc, i) => {
                if (i < data.failedTest! - 1) {
                  return { ...tc, status: "passed" as const, verdict: "accepted" as const };
                } else if (i === data.failedTest! - 1) {
                  return {
                    ...tc,
                    status: "failed" as const,
                    verdict: verdictMap[data.verdict] || "internal_error",
                    compileOutput: data.message,
                  };
                }
                return tc; // remaining tests: untouched (never ran)
              })
            );
          } else {
            // Compilation error — no test ran
            setTestCases((prev) =>
              prev.map((tc) => ({
                ...tc,
                status: "failed" as const,
                verdict: "compilation_error" as const,
                compileOutput: data.message,
              }))
            );
          }

          setIsRunning(false);
          eventSource.close();
          break;

        case "error":
          setIsRunning(false);
          eventSource.close();
          break;
      }
    };

    eventSource.onerror = () => {
      setIsRunning(false);
      eventSource.close();
    };
  } catch (err) {
    console.error("Submission error:", err);
    setIsRunning(false);
  }
}
```

**Note on `EventSource` and credentials:** The native `EventSource` API does NOT support custom headers or cookies well cross-origin. You have two options:

1. **Same-origin**: If backend and frontend are on the same domain (recommended for production), `EventSource` works natively.
2. **Cross-origin dev**: Use a library like `eventsource-polyfill` or `@microsoft/fetch-event-source` which supports credentials:

```typescript
import { fetchEventSource } from "@microsoft/fetch-event-source";

await fetchEventSource(`${BASE_URL}/api/execution/stream/${submissionId}`, {
  credentials: "include",
  onmessage(event) {
    const data = JSON.parse(event.data);
    // ... same handler logic as above
  },
  onerror(err) {
    setIsRunning(false);
  },
});
```

Install: `pnpm add @microsoft/fetch-event-source --filter web`

---

### Step 11: File Structure After Implementation

```
apps/worker/
├── src/
│   ├── index.ts                 # Consumer loop: brPop → executeSubmission
│   ├── executor.ts              # Core logic: compile → run sequential → early stop
│   ├── languages.ts             # Compiler/runner paths per language
│   ├── sandbox/
│   │   ├── interface.ts         # Sandbox interface (ExecResult, ExecOptions)
│   │   └── isolate.ts           # Isolate implementation
│   └── redis/
│       └── client.ts            # (can be removed, redis created in index.ts)
├── package.json
└── tsconfig.json

apps/backend/
├── src/
│   ├── index.ts                 # Uncomment Redis, add executionRouter
│   ├── router/
│   │   ├── executionRouter.ts   # NEW: POST /execute + GET /stream/:id
│   │   ├── judge0Router.ts      # KEEP for now (remove later)
│   │   └── ...
│   └── redis/
│       └── client.ts            # UNCOMMENT

packages/common/
├── src/
│   ├── consts.ts                # SUBMISSION_QUEUE (renamed)
│   ├── types.ts                 # NEW: SubmissionJob, SubmissionEvent, Verdict
│   └── zodTypes.ts              # Unchanged
```

---

### Step 12: Data Flow — Complete Walk-Through

```
1. User clicks "Submit" in arena-layout.tsx

2. Frontend: POST /api/execution/execute
   Body: { problemId, code, language: "CPP", type: "submit" }

3. Backend (executionRouter):
   a. Validates auth + input
   b. Fetches test cases from DB (hidden + visible)
   c. Creates Submission record (status: ATTEMPTED)
   d. Builds SubmissionJob JSON
   e. lPush to Redis "submission_queue"
   f. Returns { submissionId: "abc-123" }

4. Frontend: Opens EventSource to /api/execution/stream/abc-123

5. Backend (SSE endpoint):
   a. Creates dedicated Redis subscriber
   b. Subscribes to channel "submission:abc-123"
   c. Waits for events...

6. Worker (one of N consumers):
   a. brPop from "submission_queue" → gets the job
   b. isolate --init → creates sandbox (box 42)
   c. Writes solution.cpp into /var/local/lib/isolate/42/box/
   d. Publishes { type: "compiling" } to "submission:abc-123"
   e. isolate --run -- g++ ... → compiles
   f. If compile fails → publishes "done" with COMPILATION_ERROR → return

   g. For test case 1:
      - Publishes { type: "running", currentTest: 1, totalTests: 50 }
      - isolate --run --time=2 --mem=262144 --stdin=input.txt -- ./solution
      - Reads meta file → cpuTime: 45ms, memory: 3048KB
      - Compares stdout vs expected output
      - MATCH → publishes { type: "test_result", testNumber: 1, verdict: "ACCEPTED" }

   h. For test case 2: same...

   i. For test case 20:
      - Runs solution → stdout doesn't match expected
      - Publishes { type: "done", verdict: "WRONG_ANSWER", failedTest: 20, maxCpuTime: 45, maxMemoryUsed: 3048 }
      - Tests 21-50 NEVER RUN ← this is the whole point

   j. isolate --cleanup → destroys sandbox

7. Backend (SSE endpoint) receives "done" event:
   a. Updates Submission in DB:
      - resultVerdict: WRONG_ANSWER
      - status: ATTEMPTED
      - failedTestCaseNumber: 20
      - maxCpuTime: 45
      - maxMemoryUsed: 3048
   b. Sends event to frontend via SSE
   c. Closes connection

8. Frontend receives "done" event:
   a. Tests 1-19 → green checkmarks
   b. Test 20 → red X with "Wrong Answer"
   c. Tests 21-50 → gray (never ran)
   d. Sets isRunning = false
```

---

### Step 13: Environment Variables

**Worker VM** (`.env`):

```env
REDIS_URL=redis://<your-redis-host>:6379
DATABASE_URL=postgresql://postgres:nagmani@<your-db-host>:5432/postgres
WORKER_CONCURRENCY=4
```

**Backend** (`.env` — add):

```env
REDIS_URL=redis://localhost:6379
```

---

### Step 14: Implementation Order (What to Build First)

```
Phase 1 — Foundation (get a submission through the pipeline):
  ├── 1. packages/common — add types.ts, rename queue constant
  ├── 2. packages/database — add new Submission fields, migrate
  ├── 3. apps/worker/src/sandbox/interface.ts
  ├── 4. apps/worker/src/sandbox/isolate.ts
  ├── 5. apps/worker/src/languages.ts
  ├── 6. apps/worker/src/executor.ts
  └── 7. apps/worker/src/index.ts

Phase 2 — Backend wiring:
  ├── 8. apps/backend/src/redis/client.ts — uncomment
  ├── 9. apps/backend/src/router/executionRouter.ts — POST /execute
  ├── 10. apps/backend/src/router/executionRouter.ts — GET /stream/:id (SSE)
  └── 11. apps/backend/src/index.ts — wire new router, enable Redis

Phase 3 — Frontend:
  ├── 12. Install @microsoft/fetch-event-source
  ├── 13. arena-layout.tsx — replace handleRunFor with SSE
  └── 14. Update processJudge0Response → remove (no longer needed)

Phase 4 — Testing & Cleanup:
  ├── 15. Test C++ submission end-to-end on VM
  ├── 16. Test all 7 languages
  ├── 17. Test early termination (WA on test 3 → tests 4+ don't run)
  ├── 18. Test TLE, MLE, RE, CE scenarios
  ├── 19. Remove judge0Router.ts and related code
  └── 20. Remove Judge0 config (JUDGE0_BASE_URL)
```

---

### Edge Cases to Handle

1. **Empty output** — Solution produces nothing → compare with expected → likely WA
2. **Extra newline** — `normalizeOutput()` handles this by trimming trailing newlines
3. **Java class name** — Must be `Main.java` with `class Main` — document this for users
4. **Go module** — May need `GOPATH` environment variable in isolate
5. **Node memory** — V8 uses more memory than reported by RSS, set isolate limit higher for JS/TS
6. **Concurrent box IDs** — The `getNextBoxId()` counter in isolate.ts wraps at 1000. With 4 workers, conflicts are unlikely, but for safety could use a Set to track active IDs.
7. **Large test case input** — If input is > 64MB, isolate's `--fsize` will reject it. Handle gracefully.
8. **Submission during deploy** — If worker restarts mid-execution, the SSE endpoint times out after 5 min and returns an error. The submission stays as ATTEMPTED in DB.
