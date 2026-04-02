import "dotenv/config";

import express from "express";
import cors from "cors";
import { adminProblemRouter } from "./router/adminProblemsRouter";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./util/auth";
import { userProblemRouter } from "./router/userProblemsRouter";
import { tagsRouter } from "./router/tagsRouter";
import { executionRouter } from "./router/executionRouter";
import { submissionRouter } from "./router/submissionsRouter";
import { calendarRouter } from "./router/calendarRouter";
import { initEmail } from "@repo/email/mail";
import { redisClient, pubSubClient } from "./redis/client";
import { EXECUTOR_MODE } from "./util/config";
import { profileRouter } from "./router/profileRouter";

const app = express();
const port = process.env.PORT;

declare global {
  namespace Express {
    interface Request {
      userId?: string
      user?: any
      session?: any
    }
  }
}

const corsMiddleware = cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
});


app.use(corsMiddleware);
app.all('/api/auth/{*any}', corsMiddleware, toNodeHandler(auth));

app.use(express.json());


app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});


app.get("/health", (_req, res) => {
  res.status(200).send("ok");
});

app.use("/api/admin/problems", adminProblemRouter);
app.use("/api/user/problems", userProblemRouter);
app.use("/api/tags", tagsRouter);
// app.use("/api/judge0", judge0Router);
app.use("/api/execute", executionRouter);
app.use("/api/submissions", submissionRouter);
app.use("/api/calendar", calendarRouter);
app.use("/api/profile", profileRouter);


async function main() {
  if (EXECUTOR_MODE === "isolate") {
    await redisClient.connect();
    console.log("connected to redis client");
    await pubSubClient.connect();
    console.log("connected to pub sub client");
  }

  app.listen(port, () => {
    console.log(`server running on port ${port}`);
  });

  if (process.env.RESEND_API_KEY) {
    initEmail({
      resendApiKey: process.env.RESEND_API_KEY,
    })
  } else {
    initEmail({
      smtp: {
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT!),
        user: process.env.SMTP_USER!,
        password: process.env.SMTP_PASSWORD!,
      }
    })
  }
}
main().catch((err) => {
  console.error("Fatal error during startup:", err);
  process.exit(1);
});
