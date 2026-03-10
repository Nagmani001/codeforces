import type { RedisClientType } from "redis";
import type { SubmissionJob, SubmissionEvent, Verdict } from "@repo/common/types";
import { IsolateSandbox } from "./sandbox/isolate";
import { LANGUAGE_CONFIGS } from "./languages";

function publish(pubSubClient: RedisClientType, submissionId: string, event: SubmissionEvent) {
  return pubSubClient.publish(`submission:${submissionId}`, JSON.stringify(event));
}

export async function executeSubmission(job: SubmissionJob, pubSubClient: RedisClientType) {
  const { submissionId, code, language, testCases, cpuTimeLimit, memoryLimit } = job;
  console.log(cpuTimeLimit);
  console.log(memoryLimit);
  const config = LANGUAGE_CONFIGS[language];

  if (!config) {
    await publish(pubSubClient, submissionId, {
      type: "error",
      submissionId,
      compileOutput: `Unsupported language: ${language}`,
    });
    return { verdict: "COMPILATION_ERROR" as Verdict };
  }

  const sandbox = new IsolateSandbox();
  let overallVerdict: Verdict = "ACCEPTED";
  let failedTestCaseNumber: number | undefined;
  let maxCpuTime = 0;
  let maxMemory = 0;
  let compilationError: string | undefined;

  try {
    await sandbox.init();
    await sandbox.writeFile(config.sourceFile, code);

    // Compilation step
    if (config.compileCmd) {
      await publish(pubSubClient, submissionId, {
        type: "compile",
        submissionId,
        totalTestCases: testCases.length,
      });

      const compileResult = await sandbox.exec(config.compileCmd.command, config.compileCmd.args, {
        timeLimit: 30000,
        memoryLimit: 512000,
      });

      if (compileResult.exitCode !== 0) {
        compilationError = compileResult.stdout || compileResult.stderr || "Compilation failed";
        await publish(pubSubClient, submissionId, {
          type: "done",
          submissionId,
          overallVerdict: "COMPILATION_ERROR",
          compileOutput: compilationError,
          totalTestCases: testCases.length,
        });
        console.log("i ran");
        return {
          verdict: "COMPILATION_ERROR" as Verdict,
          compilationError,
          totalTestCases: testCases.length,
        };
      }
    }

    // Run test cases sequentially
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i]!;

      const result = await sandbox.exec(config.runCmd.command, config.runCmd.args, {
        timeLimit: cpuTimeLimit,
        memoryLimit: memoryLimit,
        stdinData: tc.input,
      });

      const cpuTime = result.cpuTime ?? 0;
      const memory = result.memory ?? 0;
      maxCpuTime = Math.max(maxCpuTime, cpuTime);
      maxMemory = Math.max(maxMemory, memory);

      let verdict: Verdict = "ACCEPTED";

      if (result.status === "TO" || result.signal === "sigxcpu") {
        verdict = "TIME_LIMIT_EXCEEDED";
      } else if (result.status === "SG" && result.signal !== "sigxcpu") {
        // Check if it was killed for memory
        if (memory >= memoryLimit) {
          verdict = "MEMORY_LIMIT_EXCEEDED";
        } else {
          verdict = "RUNTIME_ERROR";
        }
      } else if (result.status === "RE" || result.exitCode !== 0) {
        verdict = "RUNTIME_ERROR";
      } else {
        // Compare output
        const expected = tc.output.trim();
        const actual = result.stdout.trim();
        if (actual !== expected) {
          verdict = "WRONG_ANSWER";
        }
      }

      const event: SubmissionEvent = {
        type: "testcase",
        submissionId,
        testCaseNumber: i + 1,
        totalTestCases: testCases.length,
        verdict,
        time: cpuTime,
        memory,
        stdout: result.stdout.slice(0, 1000),
        stderr: result.stderr?.slice(0, 1000),
      };

      await publish(pubSubClient, submissionId, event);

      if (verdict !== "ACCEPTED") {
        overallVerdict = verdict;
        failedTestCaseNumber = i + 1;
        break;
      }
    }

    // Done event
    await publish(pubSubClient, submissionId, {
      type: "done",
      submissionId,
      overallVerdict,
      totalTestCases: testCases.length,
    });

    return {
      verdict: overallVerdict,
      failedTestCaseNumber,
      maxCpuTime,
      maxMemoryUsed: maxMemory,
      totalTestCases: testCases.length,
    };
  } finally {
    await sandbox.destroy();
  }
}
