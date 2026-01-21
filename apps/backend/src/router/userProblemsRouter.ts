import prisma from "@repo/database/client";
import { Router, Request, Response } from "express";
import { getProblemsAuthenticated, getProblemsUnauthenticated, noProblemId } from "../util/lib";
import { auth } from "../util/auth";
import { fromNodeHeaders } from "better-auth/node";

export const userProblemRouter: Router = Router();

userProblemRouter.get("/", async (req: Request, res: Response) => {
  let problems;
  const page = Number(req.query.page);

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    problems = await getProblemsUnauthenticated(page);
  } else {
    problems = await getProblemsAuthenticated(page, session.user.id);
  }
  res.json({
    problems,
    role: "user"
  });

});


userProblemRouter.get("/:problemId", async (req: Request, res: Response) => {
  const problemId = req.params.problemId as string;
  if (!problemId) return noProblemId(res);

  const problem = await prisma.problems.findFirst({
    where: {
      id: problemId,
      isDeleted: false
    },
    select: {
      id: true,
      title: true,
      description: true,
      isDeleted: false,
      constraints: true,
      problemType: true,
      tags: true,
      cpuTimeLimit: true,
      memoryTimeLimit: true,
      visibleTestCases: true,
      hiddenTestCases: false,
      submission: false
    }
  });

  let starterCodeObj: any = {};
  const starterCode = await prisma.starterCode.findMany();

  starterCode.forEach(x => {
    starterCodeObj[x.language] = x.code;
  })

  if (problem && starterCode) {
    res.json({
      problem,
      starterCodeObj
    });
  } else {
    res.status(404).json({
      message: 404
    })
  }
});
