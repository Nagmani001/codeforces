import { config as dotenvConfig } from "dotenv";

if (process.env.DOTENV_CONFIG_PATH) {
  dotenvConfig({ path: process.env.DOTENV_CONFIG_PATH });
} else {
  dotenvConfig();
}

export const JUDGE0_BASE_URL = process.env.JUDGE0_BASE_URL || "https://judge0.nagmaniupadhyay.com.np";
export const EXECUTOR_MODE = (process.env.EXECUTOR_MODE || "judge0") as "judge0" | "isolate";
