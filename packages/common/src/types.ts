export interface DifficultyStats {
  solved: number;
  total: number;
};

export interface ProblemStats {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
};

export type Verdict =
  | "ACCEPTED"
  | "WRONG_ANSWER"
  | "TIME_LIMIT_EXCEEDED"
  | "MEMORY_LIMIT_EXCEEDED"
  | "RUNTIME_ERROR"
  | "COMPILATION_ERROR";

export interface SubmissionJob {
  submissionId: string;
  code: string;
  language: string;
  problemId: string;
  testCases: { input: string; output: string }[];
  cpuTimeLimit: number;
  memoryLimit: number;
  type: "run" | "submit";
  userId: string;
}

export interface SubmissionEvent {
  type: "compile" | "testcase" | "done" | "error";
  submissionId: string;
  testCaseNumber?: number;
  totalTestCases?: number;
  verdict?: Verdict;
  time?: number;
  memory?: number;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  overallVerdict?: Verdict;
}

export interface ExecuteResponse {
  mode: "judge0" | "isolate";
  submissionId: string | null;
  judge0?: any;
}
