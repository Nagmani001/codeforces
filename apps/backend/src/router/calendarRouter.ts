import { Router, Request, Response } from "express";
import { invalidInputs } from "../util/lib";
import prisma from "@repo/database/client";
import { authMiddlewareUser } from "../middleware/authMiddleware";

export const calendarRouter: Router = Router();

calendarRouter.use(authMiddlewareUser);

calendarRouter.get("/month", async (req: Request, res: Response) => {
  const session = res.locals.session;

  const year = Number(req.query.year);
  const month = Number(req.query.month); // 1-12
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return invalidInputs(res);
  }

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const nextMonthStart = new Date(Date.UTC(year, month, 1));

  const monthEntries = await prisma.calendar.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: monthStart,
        lt: nextMonthStart,
      },
    },
    select: {
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });
  const submittedDays = monthEntries.map((entry) => entry.date.getUTCDate());

  return res.json({
    submittedDays,
  });
});
