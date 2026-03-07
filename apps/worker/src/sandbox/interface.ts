export interface ExecOptions {
  timeLimit?: number;
  memoryLimit?: number;
  stdinData?: string;
  env?: Record<string, string>;
}

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  cpuTime?: number;
  memory?: number;
  signal?: string;
  status?: string;
}

export interface Sandbox {
  init(): Promise<void>;
  writeFile(relativePath: string, content: string): Promise<void>;
  exec(command: string, args: string[], options?: ExecOptions): Promise<ExecResult>;
  destroy(): Promise<void>;
}
