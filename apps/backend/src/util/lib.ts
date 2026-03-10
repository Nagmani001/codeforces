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

export async function getProblemsUnauthenticated(cursor: string | undefined) {
  let problems;
  (cursor) ?
    problems = await prisma.problems.findMany({
      skip: 1,
      take: 15,
      cursor: {
        id: cursor
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
    }) : problems = await prisma.problems.findMany({
      take: 15,
      skip: 0,
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

export async function getProblemsAuthenticated(cursor: string | undefined, userId: string) {
  let problems;
  (cursor) ?
    problems = await prisma.problems.findMany({
      skip: 1,
      take: 15,
      cursor: {
        id: cursor
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
      take: 15,
      skip: 0,
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

export function languageTolanguageId(language: string) {
  switch (language) {
    case "CPP":
      return 54;

    case "JAVASCRIPT":
      return 63;

    case "TYPESCRIPT":
      return 74;

    case "RUST":
      return 73;

    case "GO":
      return 60;

    case "PYTHON":
      return 71;

    case "JAVA":
      return 62;

    default:
      throw new Error(`Unsupported language: ${language}`);
  }
}



