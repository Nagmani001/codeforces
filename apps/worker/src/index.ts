import { config } from "dotenv";
config();
import { pubSubClient, redisClient } from "./redis/client";
import { SUBMISSION_QUEUE } from "@repo/common/consts";
import { executeSubmission } from "./executor";
import type { SubmissionJob } from "@repo/common/types";


const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || "2", 10);

async function workerLoop(id: number) {
  console.log(`[worker-${id}] listening on ${SUBMISSION_QUEUE}`);

  while (true) {
    try {
      const popped = await redisClient.brPop(SUBMISSION_QUEUE, 0);
      if (!popped) continue;

      const job: SubmissionJob = JSON.parse(popped.element);
      console.log(`[worker-${id}] processing submission ${job.submissionId} (${job.language})`);

      try {
        const result = await executeSubmission(job, pubSubClient);
        console.log(`[worker-${id}] finished ${job.submissionId}: ${result.verdict}`);
      } catch (err) {
        console.error(`[worker-${id}] execution error for ${job.submissionId}:`, err);
        await pubSubClient.publish(
          `submission:${job.submissionId}`,
          JSON.stringify({
            type: "error",
            submissionId: job.submissionId,
            compileOutput: "Internal worker error",
          })
        );
      }
    } catch (err) {
      console.error(`[worker-${id}] redis error:`, err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}

async function main() {
  await redisClient.connect();
  console.log("connected to redis client");
  await pubSubClient.connect();
  console.log("connected to pub sub client");

  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(workerLoop(i));
  }

  await Promise.all(workers);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
