import prisma from "@repo/database/client";
import { Router, Request, Response } from "express";

export const tagsRouter: Router = Router();


tagsRouter.get("/getAll", async (req: Request, res: Response) => {
  const allTags = await prisma.problemTag.findMany();
  res.json(allTags.map(x => x.title));
})
