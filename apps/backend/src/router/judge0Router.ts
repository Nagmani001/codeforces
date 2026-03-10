import { Router, Request, Response } from "express";
import { invalidInputs, languageTolanguageId } from "../util/lib";
import prisma from "@repo/database/client";
import { submissionSchema } from "@repo/common/zodTypes";
import axios from "axios";
import { JUDGE0_BASE_URL } from "../util/config";
import { authMiddlewareUser } from "../middleware/authMiddleware";

export const judge0Router: Router = Router();

judge0Router.use(authMiddlewareUser);

judge0Router.post("/execute", async (req: Request, res: Response) => {
  const session = res.locals.session;

  const parsedData = submissionSchema.safeParse(req.body);
  if (!parsedData.success) return invalidInputs(res);
  const { problemId, code, language, type } = parsedData.data;

  const testCases = await prisma.problems.findFirst({
    where: {
      id: problemId
    },
    select: {
      visibleTestCases: {
        select: {
          input: true,
          output: true,
        }
      },
      hiddenTestCases: {
        select: {
          input: true,
          output: true,
        }
      },
      title: false,
      createdAt: false,
      isDeleted: false,
      description: false,
      cpuTimeLimit: false,
      memoryTimeLimit: false
    }
  });

  let test;
  if (type == "run") {
    test = [
      ...testCases?.visibleTestCases!,
    ];
  } else {
    test = [
      ...testCases?.hiddenTestCases!,
      ...testCases?.visibleTestCases!,
    ];
  }

  const language_id = languageTolanguageId(language);

  let toJudge0 = test.map((x: any) => {
    return {
      language_id,
      source_code: Buffer.from(code).toString("base64"),
      stdin: Buffer.from(x.input).toString("base64"),
      expected_output: Buffer.from(x.output).toString("base64")
    }
  });

  try {
    const judge0Response = await axios.post(`${JUDGE0_BASE_URL}/submissions/batch/?base64_encoded=true`, {
      submissions: toJudge0
    });

    let submission;
    if (type == "submit") {
      submission = await prisma.submission.create({
        data: {
          code,
          language,
          status: "ATTEMPTED",
          problemId,
          userId: session.user.id,
        }
      })
    }

    if (submission) {

      res.json({
        judge0: judge0Response.data,
        submissionId: submission!.id
      });

    } else {

      res.json({
        judge0: judge0Response.data,
        submissionId: null
      });

    }
  } catch (err) {
    console.log("execute error ", err);
    res.status(500).json({
      msg: "something went wrong"
    });
  }
});

judge0Router.get("/submission", async (req: Request, res: Response) => {
  const tokens = req.query.tokens;
  const submissionId = req.query.submissionId as string | undefined;
  const type = req.query.type;
  if (!tokens || !type) return invalidInputs(res);

  try {
    const judge0Response = await axios.get(`${JUDGE0_BASE_URL}/submissions/batch?tokens=${tokens}&base64_encoded=true`);
    let isProcessing = false;


    judge0Response.data.submissions.forEach((x: any) => {
      if (x.status.description == "Processing" || x.status.description == "In Queue") {
        isProcessing = true;
      }
    });

    if (!isProcessing) {
      let resultVerdict = "";

      for (const x of judge0Response.data.submissions) {
        if (x.status.description == "Accepted") {
          continue;
        } else {
          resultVerdict = x.status.description;
          break;
        }
      }


      if (resultVerdict == "") {
        resultVerdict = "ACCEPTED"
      } else {
        if (resultVerdict == "Wrong Answer") {
          resultVerdict = "WRONG_ANSWER";
        } else if (resultVerdict == "Time Limit Exceeded") {
          resultVerdict = "TIME_LIMIT_EXCEEDED";
        } else if (resultVerdict == "Memory Limit Exceeded") {
          resultVerdict = "MEMORY_LIMIT_EXCEEDED";
        } else if (resultVerdict.startsWith("Runtime Error")) {
          resultVerdict = "RUNTIME_ERROR";
        } else if (resultVerdict == "Compilation Error") {
          resultVerdict = "COMPILATION_ERROR";
        }
      }

      if (type == "submit") {
        await prisma.submission.update({
          where: {
            id: submissionId
          },
          data: {
            //@ts-ignore
            resultVerdict,
            status: resultVerdict == "ACCEPTED" ? "SOLVED" : "ATTEMPTED"
          }
        })
      }
    }
    res.json({
      judge0Response: judge0Response.data,
    })
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "something went wrong"
    });
  }
});
