import { execFile } from "child_process";
import { promisify } from "util";
import { writeFile as fsWriteFile, readFile, mkdir } from "fs/promises";
import path from "path";
import type { Sandbox, ExecOptions, ExecResult } from "./interface";

const execFileAsync = promisify(execFile);

let nextBoxId = 0;

function getNextBoxId(): number {
  return nextBoxId++ % 1000;
}

interface MetaInfo {
  cpuTime?: number;
  wallTime?: number;
  memory?: number;
  exitCode?: number;
  signal?: string;
  status?: string;
  message?: string;
}

function parseMeta(content: string): MetaInfo {
  const meta: MetaInfo = {};
  for (const line of content.split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.substring(0, sep).trim();
    const value = line.substring(sep + 1).trim();
    switch (key) {
      case "time":
        meta.cpuTime = Math.round(parseFloat(value) * 1000);
        break;
      case "time-wall":
        meta.wallTime = Math.round(parseFloat(value) * 1000);
        break;
      case "max-rss":
        meta.memory = parseInt(value, 10);
        break;
      case "exitcode":
        meta.exitCode = parseInt(value, 10);
        break;
      case "killed":
        meta.signal = value;
        break;
      case "status":
        meta.status = value;
        break;
      case "message":
        meta.message = value;
        break;
    }
  }
  return meta;
}

export class IsolateSandbox implements Sandbox {
  private boxId: number;
  private boxPath: string = "";
  private metaFile: string = "";
  private initialized = false;

  constructor() {
    this.boxId = getNextBoxId();
  }

  async init(): Promise<void> {
    try {
      await execFileAsync("isolate", ["--box-id", String(this.boxId), "--cleanup"]);
    } catch {
      // cleanup may fail if box doesn't exist yet
    }

    const { stdout } = await execFileAsync("isolate", [
      "--box-id", String(this.boxId),
      "--init",
    ]);
    this.boxPath = path.join(stdout.trim(), "box");
    this.metaFile = `/tmp/isolate-meta-${this.boxId}.txt`;
    this.initialized = true;
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    if (!this.initialized) throw new Error("Sandbox not initialized");
    const fullPath = path.join(this.boxPath, relativePath);
    const dir = path.dirname(fullPath);
    await mkdir(dir, { recursive: true });
    await fsWriteFile(fullPath, content, "utf-8");
  }

  async exec(command: string, args: string[], options: ExecOptions = {}): Promise<ExecResult> {
    if (!this.initialized) throw new Error("Sandbox not initialized");

    const timeLimitSec = options.timeLimit ? options.timeLimit / 1000 : 10;
    const wallTimeSec = timeLimitSec * 3;
    const memoryKB = options.memoryLimit || 256000;

    const isolateArgs = [
      "--box-id", String(this.boxId),
      "--meta", this.metaFile,
      "--time", String(timeLimitSec),
      "--wall-time", String(wallTimeSec),
      "--mem", String(memoryKB),
      "--processes=64",
      "--stderr-to-stdout",
      "--run", "--",
      command,
      ...args,
    ];

    let stdout = "";
    let stderr = "";
    let exitCode = 0;

    try {
      const result = await new Promise<{ stdout: string; stderr: string; exitCode: number }>((resolve) => {
        const child = execFile("isolate", isolateArgs, {
          maxBuffer: 10 * 1024 * 1024,
          timeout: (wallTimeSec + 5) * 1000,
        }, (error, stdoutBuf, stderrBuf) => {
          resolve({
            stdout: stdoutBuf || "",
            stderr: stderrBuf || "",
            exitCode: error ? (error as any).code ?? 1 : 0,
          });
        });

        if (options.stdinData && child.stdin) {
          child.stdin.write(options.stdinData);
          child.stdin.end();
        }
      });

      stdout = result.stdout;
      stderr = result.stderr;
      exitCode = result.exitCode;
    } catch (err: any) {
      exitCode = err.code ?? 1;
      stdout = err.stdout ?? "";
      stderr = err.stderr ?? "";
    }

    let meta: MetaInfo = {};
    try {
      const metaContent = await readFile(this.metaFile, "utf-8");
      meta = parseMeta(metaContent);
    } catch {
      // meta file might not exist if isolate crashed
    }

    return {
      stdout,
      stderr,
      exitCode: meta.exitCode ?? exitCode,
      cpuTime: meta.cpuTime,
      memory: meta.memory,
      signal: meta.signal,
      status: meta.status,
    };
  }

  async destroy(): Promise<void> {
    if (!this.initialized) return;
    try {
      await execFileAsync("isolate", ["--box-id", String(this.boxId), "--cleanup"]);
    } catch {
      // best effort cleanup
    }
    this.initialized = false;
  }
}
