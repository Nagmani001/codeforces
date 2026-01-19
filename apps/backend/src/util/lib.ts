import prisma from "@repo/database/client";
import { Response } from "express";

export function invalidInputs(res: Response) {
  return res.status(400).json({
    message: "invali inputs"
  });
}


export function unauthorized(res: Response) {
  return res.status(403).json({
    message: "unauthorized"
  });
}


export function notAdmin(res: Response) {
  return res.status(403).json({
    message: "not an admin"
  });
}

export function noProblemId(res: Response) {
  return res.status(404).json({
    message: "no problem id provided"
  });
}

export async function getProblemsUnauthenticated(page: number) {
  let problems;
  (page == 1) ?
    problems = await prisma.problems.findMany({
      skip: 0,
      take: 10,
      orderBy: {
        createdAt: "desc"
      },
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        title: true,
        problemType: true,
        tags: true,
        description: false,
        createdAt: false,
        isDeleted: false,
        cpuTimeLimit: false,
        memoryTimeLimit: false,
        visibleTestCases: false,
        hiddenTestCases: false,
        userId: false
      }
    }) : problems = await prisma.problems.findMany({
      take: 10,
      skip: (page * 10) - 10,
      orderBy: {
        createdAt: "desc"
      },
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        title: true,
        problemType: true,
        tags: true,
        description: false,
        createdAt: false,
        isDeleted: false,
        cpuTimeLimit: false,
        memoryTimeLimit: false,
        visibleTestCases: false,
        hiddenTestCases: false,
        userId: false,
        submission: false,
      }
    });

  return problems;
}

export async function getProblemsAuthenticated(page: number, userId: string) {
  let problems;
  (page == 1) ?
    problems = await prisma.problems.findMany({
      skip: 0,
      take: 10,
      orderBy: {
        createdAt: "desc"
      },
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        title: true,
        problemType: true,
        tags: true,
        description: false,
        createdAt: false,
        isDeleted: false,
        cpuTimeLimit: false,
        memoryTimeLimit: false,
        visibleTestCases: false,
        hiddenTestCases: false,
        userId: false,
        submission: {
          where: { userId },
          select: {
            status: true
          }
        }
      }
    }) : problems = await prisma.problems.findMany({
      take: 10,
      skip: (page * 10) - 10,
      orderBy: {
        createdAt: "desc"
      },
      where: {
        isDeleted: false
      },
      select: {
        id: true,
        title: true,
        problemType: true,
        tags: true,
        description: false,
        createdAt: false,
        isDeleted: false,
        cpuTimeLimit: false,
        memoryTimeLimit: false,
        visibleTestCases: false,
        hiddenTestCases: false,
        userId: false,
        submission: {
          where: { userId },
          select: {
            status: true
          }
        }
      }
    });

  return problems;

}
