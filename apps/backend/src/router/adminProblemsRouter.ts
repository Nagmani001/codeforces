import { Router, Request, Response } from "express";
import prisma from "@repo/database/client";
import { RelatedProblemsModelOptional } from "@repo/database/zodTypes/problems";
import { invalidInputs, noProblemId } from "../util/lib";
import { createProblemSchema } from "@repo/common/zodTypes";
import { authMiddlewareAdmin } from "../middleware/authMiddleware";

export const adminProblemRouter: Router = Router();

adminProblemRouter.use(authMiddlewareAdmin);

adminProblemRouter.get("/", async (req: Request, res: Response) => {
  const page = Number(req.query.page);
  let problems;

  (page == 1) ?
    problems = await prisma.problems.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc"
      }
    }) : problems = await prisma.problems.findMany({
      take: 10,
      skip: (page * 10) - 10,
      orderBy: {
        createdAt: "desc"
      }
    })

  res.json({
    problems,
    role: "admin"
  });
});

adminProblemRouter.post("/createProblem", async (req: Request, res: Response) => {
  const session = res.locals.session;

  const parsedData = createProblemSchema.safeParse(req.body);
  if (!parsedData.success) return invalidInputs(res);

  const { title, problemType, tags, constraints, description, cpuTimeLimit, memoryTimeLimit, visibleTestCases, hiddenTestCases } = parsedData.data;

  await prisma.problems.create({
    data: {
      title,
      problemType,
      userId: session.user.id,
      tags: {
        connect: tags
      },
      constraints,
      description,
      cpuTimeLimit,
      memoryTimeLimit,
      visibleTestCases: {
        create: visibleTestCases
      },
      hiddenTestCases: {
        create: hiddenTestCases
      }
    }
  });
  res.status(201).json({
    message: "problem created"
  });
});


adminProblemRouter.put("/updateProblem/:problemId", async (req: Request, res: Response) => {
  const problemId = req.params.problemId as string;
  if (!problemId) return noProblemId(res);
  const parsedData = RelatedProblemsModelOptional.safeParse(req.body);
  if (!parsedData.success) return invalidInputs(res);
  const { title, description, cpuTimeLimit, memoryTimeLimit, visibleTestCases, hiddenTestCases } = parsedData.data;

  let queries = [];

  if (title || description || cpuTimeLimit || memoryTimeLimit) {
    queries.push(
      prisma.problems.update({
        where: {
          id: problemId
        },
        data: {
          title,
          description,
          cpuTimeLimit,
          memoryTimeLimit,
        }
      }));
  }

  if (visibleTestCases) {
    queries.push(
      prisma.visibleTestCases.deleteMany({
        where: {
          problemId
        }
      }),
      prisma.problems.update({
        where: {
          id: problemId
        },
        data: {
          visibleTestCases: {
            create: visibleTestCases
          },
        }
      }),
    )
  }

  if (hiddenTestCases) {
    queries.push(
      prisma.hiddenTestCases.deleteMany({
        where: {
          problemId
        }
      }),
      prisma.problems.update({
        where: {
          id: problemId
        },
        data: {
          hiddenTestCases: {
            create: hiddenTestCases
          },
        }
      }),
    )
  }

  if (queries.length > 0) {
    await prisma.$transaction(queries);
  } else {
    return res.status(400).json({
      message: "nothing to update"
    })
  }


  res.status(200).json({
    message: "update problem"
  });
});

adminProblemRouter.delete("/deleteProblem/:problemId", async (req: Request, res: Response) => {
  const problemId = req.params.problemId as string;
  if (!problemId) return noProblemId(res);

  await prisma.problems.update({
    where: {
      id: problemId
    },
    data: {
      isDeleted: true
    }
  });

  res.json({
    message: "deleted problem"
  })
});
