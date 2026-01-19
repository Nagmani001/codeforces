import { z } from "zod";

export const signupSchema = z.object({
  email: z.email(),
  username: z.string(),
  confirmPassword: z.string().trim().min(8),
  password: z.string().trim().min(8),
  agreeToTerms: z.literal(true, {
    error: () => ({ message: "You must agree to the terms" })
  }),
}).refine(value => {
  return value.password == value.confirmPassword
}, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export type signupType = z.infer<typeof signupSchema>


export const signinSchema = z.object({
  email: z.email(),
  password: z.string().trim().min(5).max(30),
});

export const otpSchema = z.object({
  otp: z.string()
});


const testCases = z.object({
  input: z.string(),
  output: z.string(),
});

export const createProblemSchema = z.object({
  title: z.string(),
  description: z.string(),
  cpuTimeLimit: z.number(),
  memoryTimeLimit: z.number(),
  visibleTestCases: z.array(testCases),
  hiddenTestCases: z.array(testCases)
});


export const updateProblemSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  cpuTimeLimit: z.number().optional(),
  memoryTimeLimit: z.number().optional(),
  visibleTestCases: z.array(testCases).optional(),
  hiddenTestCases: z.array(testCases).optional()
});

export const submissionSchema = z.object({
  problemId: z.string(),
  language: z.string(),
  code: z.string(),
});
