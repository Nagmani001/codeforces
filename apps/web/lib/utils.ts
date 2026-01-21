import axios from "axios";
import { BASE_URL } from "./config";
import { ProblemDetail, problems } from "./temp";

export async function getProblems(page: number, cookieStore: any) {
  const cookieHeader = Array.from(cookieStore._parsed.values())
    .map(({ name, value }: any) => {
      return `${name}=${encodeURIComponent(value)}`;
    })
    .join("; ");
  const problems = await axios.get(`${BASE_URL}/api/user/problems?page=${page}`, {
    headers: {
      "cookie": cookieHeader
    }
  });
  return problems;
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
