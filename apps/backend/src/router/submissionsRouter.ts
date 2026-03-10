import { Router, Request, Response } from "express";
import { invalidInputs } from "../util/lib";
import prisma from "@repo/database/client";
import { authMiddlewareUser } from "../middleware/authMiddleware";

export const submissionRouter: Router = Router();

submissionRouter.use(authMiddlewareUser);

submissionRouter.get("/", async (req: Request, res: Response) => {
  const session = res.locals.session;
  const problemId = req.query.problemId as string;
  if (!problemId) return invalidInputs(res);

  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id,
      problemId
    }
  });
  return res.json({
    submissions
  });
});
