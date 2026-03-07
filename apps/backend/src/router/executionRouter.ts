import { Router, Request, Response } from "express";
import { invalidInputs, languageTolanguageId, unauthorized } from "../util/lib";
import prisma from "@repo/database/client";
import { submissionSchema } from "@repo/common/zodTypes";
import { SUBMISSION_QUEUE } from "@repo/common/consts";
import axios from "axios";
import { JUDGE0_BASE_URL, EXECUTOR_MODE } from "../util/config";
import { auth } from "../util/auth";
import { fromNodeHeaders } from "better-auth/node";
import { redisClient, pubSubClient } from "../redis/client";
import { v4 as uuidv4 } from "uuid";
import type { SubmissionJob, SubmissionEvent } from "@repo/common/types";

export const executionRouter: Router = Router();

// POST /execute — unified entry point
executionRouter.post("/execute", async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return unauthorized(res);

  const parsedData = submissionSchema.safeParse(req.body);
  if (!parsedData.success) return invalidInputs(res);
  const { problemId, code, language, type } = parsedData.data;

  const problem = await prisma.problems.findFirst({
    where: { id: problemId },
    select: {
      visibleTestCases: { select: { input: true, output: true } },
      hiddenTestCases: { select: { input: true, output: true } },
      cpuTimeLimit: true,
      memoryTimeLimit: true,
    },
  });

  if (!problem) return res.status(404).json({ msg: "Problem not found" });

  const testCases =
    type === "run"
      ? [...problem.visibleTestCases]
      : [...problem.hiddenTestCases, ...problem.visibleTestCases];

  if (EXECUTOR_MODE === "isolate") {
    // ---- Isolate path: push job to Redis queue ----
    let submission;
    if (type === "submit") {
      submission = await prisma.submission.create({
        data: {
          code,
          language,
          status: "ATTEMPTED",
          problemId,
          userId: session.user.id,
        },
      });
    }

    const submissionId = submission?.id || uuidv4();

    const job: SubmissionJob = {
      submissionId,
      code,
      language,
      problemId,
      testCases,
      cpuTimeLimit: problem.cpuTimeLimit,
      memoryLimit: problem.memoryTimeLimit,
      type,
      userId: session.user.id,
    };

    await redisClient.lPush(SUBMISSION_QUEUE, JSON.stringify(job));

    return res.json({
      mode: "isolate" as const,
      submissionId,
    });
  } else {
    // ---- Judge0 path: send to Judge0 API ----
    const language_id = languageTolanguageId(language);

    const toJudge0 = testCases.map((x) => ({
      language_id,
      source_code: Buffer.from(code).toString("base64"),
      stdin: Buffer.from(x.input).toString("base64"),
      expected_output: Buffer.from(x.output).toString("base64"),
    }));

    try {
      const judge0Response = await axios.post(
        `${JUDGE0_BASE_URL}/submissions/batch/?base64_encoded=true`,
        { submissions: toJudge0 }
      );

      let submission;
      if (type === "submit") {
        submission = await prisma.submission.create({
          data: {
            code,
            language,
            status: "ATTEMPTED",
            problemId,
            userId: session.user.id,
          },
        });
      }

      return res.json({
        mode: "judge0" as const,
        submissionId: submission?.id || null,
        judge0: judge0Response.data,
      });
    } catch (err) {
      console.error("judge0 execute error:", err);
      return res.status(500).json({ msg: "something went wrong" });
    }
  }
});

// GET /stream/:submissionId — SSE endpoint for isolate mode
executionRouter.get("/stream/:submissionId", async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return unauthorized(res);

  const submissionId = req.params.submissionId as string;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders();

  const subscriber = pubSubClient.duplicate();
  await subscriber.connect();

  const channel = `submission:${submissionId}`;

  await subscriber.subscribe(channel, async (message) => {
    const event: SubmissionEvent = JSON.parse(message);
    res.write(`data: ${message}\n\n`);

    if (event.type === "done" || event.type === "error") {
      // Update DB if this was a "submit" type
      try {
        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
        });

        if (submission) {
          const verdict = event.overallVerdict || event.type === "error" ? "COMPILATION_ERROR" : undefined;
          await prisma.submission.update({
            where: { id: submissionId },
            data: {
              resultVerdict: event.overallVerdict as any,
              status: event.overallVerdict === "ACCEPTED" ? "SOLVED" : "ATTEMPTED",
              compilationError: event.compileOutput,
              totalTestCases: event.totalTestCases,
            },
          });
        }
      } catch (err) {
        console.error("DB update error:", err);
      }

      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
      res.end();
    }
  });

  req.on("close", async () => {
    try {
      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
    } catch {
      // client already disconnected
    }
  });
});

// GET /submission — Judge0 polling proxy (same logic as judge0Router)
executionRouter.get("/submission", async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) return unauthorized(res);

  const tokens = req.query.tokens;
  const submissionId = req.query.submissionId as string | undefined;
  const type = req.query.type;
  if (!tokens || !type) return invalidInputs(res);

  try {
    const judge0Response = await axios.get(
      `${JUDGE0_BASE_URL}/submissions/batch?tokens=${tokens}&base64_encoded=true`
    );
    let isProcessing = false;

    judge0Response.data.submissions.forEach((x: any) => {
      if (x.status.description === "Processing" || x.status.description === "In Queue") {
        isProcessing = true;
      }
    });

    if (!isProcessing) {
      let resultVerdict = "";

      for (const x of judge0Response.data.submissions) {
        if (x.status.description === "Accepted") {
          continue;
        } else {
          resultVerdict = x.status.description;
          break;
        }
      }

      if (resultVerdict === "") {
        resultVerdict = "ACCEPTED";
      } else {
        if (resultVerdict === "Wrong Answer") {
          resultVerdict = "WRONG_ANSWER";
        } else if (resultVerdict === "Time Limit Exceeded") {
          resultVerdict = "TIME_LIMIT_EXCEEDED";
        } else if (resultVerdict === "Memory Limit Exceeded") {
          resultVerdict = "MEMORY_LIMIT_EXCEEDED";
        } else if (resultVerdict.startsWith("Runtime Error")) {
          resultVerdict = "RUNTIME_ERROR";
        } else if (resultVerdict === "Compilation Error") {
          resultVerdict = "COMPILATION_ERROR";
        }
      }

      if (type === "submit" && submissionId) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            //@ts-ignore
            resultVerdict,
            status: resultVerdict === "ACCEPTED" ? "SOLVED" : "ATTEMPTED",
          },
        });
      }
    }

    res.json({ judge0Response: judge0Response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "something went wrong" });
  }
});
