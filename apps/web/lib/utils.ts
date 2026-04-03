import axios from "axios";
import { BASE_URL } from "./config";
import { ProblemDetail, TestCase, TestCaseVerdict } from "./temp";

export async function getProblems(cookieStore: any) {
  const cookieHeader = Array.from(cookieStore._parsed.values())
    .map(({ name, value }: any) => {
      return `${name}=${encodeURIComponent(value)}`;
    })
    .join("; ");
  const problems = await axios.get(`${BASE_URL}/api/user/problems`, {
    headers: {
      "cookie": cookieHeader
    }
  });
  return problems;
}
export async function getUser(cookieStore: any) {
  const cookieHeader = Array.from(cookieStore._parsed.values())
    .map(({ name, value }: any) => {
      return `${name}=${encodeURIComponent(value)}`;
    })
    .join("; ");
  const user = await axios.get(`${BASE_URL}/api/me`, {
    headers: {
      "cookie": cookieHeader
    }
  });
  return user;
}

export async function getAllTags() {
  const allTags = axios.get(`${BASE_URL}/api/tags/getAll`);
  return allTags;
}

export async function getSpecificProblem(problemId: string) {
  const problem = axios.get(`${BASE_URL}/api/user/problems/${problemId}`);
  return problem;
}

export function getProblemPrettified(problem: any) {
  const examples = problem.problem.visibleTestCases.map((x: any) => {
    return x.explanation ? {
      input: x.input,
      output: x.output,
      explanation: x.explanation
    } : {
      input: x.input,
      output: x.output,
    }
  });

  const testCases = problem.problem.visibleTestCases.map((x: any) => {
    return {
      id: x.id,
      input: x.input,
      expectedOutput: x.output
    }
  });

  let actualProblem: ProblemDetail = {
    id: problem.problem.id,
    title: problem.problem.title,
    description: problem.problem.description,
    problemType: problem.problem.problemType,
    constraints: problem.problem.constraints,
    examples: examples,
    testCases: testCases,
    starterCode: problem.starterCodeObj,
  };
  return actualProblem;
}

function statusIdToVerdict(id: number): TestCaseVerdict {
  if (id === 3) return "accepted"
  if (id === 4) return "wrong_answer"
  if (id === 5) return "tle"
  if (id === 6) return "compilation_error"
  if (id >= 7 && id <= 12) return "runtime_error"
  return "internal_error"
}

export function processJudge0Response(
  submissions: any[],
  currentTestCases: TestCase[]
): TestCase[] {
  return currentTestCases.map((tc, i) => {
    const sub = submissions[i]
    if (!sub) return tc

    const verdict = statusIdToVerdict(sub.status.id)

    return {
      ...tc,
      verdict,
      status: verdict === "accepted" ? "passed" as const : "failed" as const,
      actualOutput: sub.stdout ?? undefined,
      stderr: sub.stderr ?? undefined,
      compileOutput: sub.compile_output ?? undefined,
      time: sub.time ?? undefined,
      memory: sub.memory ?? undefined,
    }
  })
}

export async function getProblemsList(cursor: string) {
  const problems = await axios.get(`${BASE_URL}/api/user/problems/problemsList/${cursor}`);
  return problems.data;
}

export async function getProblemStatus(cookieStore: any) {
  const cookieHeader = Array.from(cookieStore._parsed.values())
    .map(({ name, value }: any) => {
      return `${name}=${encodeURIComponent(value)}`;
    })
    .join("; ");

  const res = await axios.get(`${BASE_URL}/api/user/problems/progress-widget`, {
    headers: {
      "cookie": cookieHeader
    }
  });
  return res.data;
}
