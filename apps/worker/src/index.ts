/*
INFO: This part of the codebase is left commented since the implementaion of code execution using e2b or firecracker is yet to be implemented 

import { pubSubClient, redisClient } from "./redis/client";
import { FIRE_CRACKER_QUEUE } from "@repo/common/consts";

async function main() {
  await redisClient.connect();
  await pubSubClient.connect();
  console.log("connected to redis");


  while (true) {
    const popped = await redisClient.brPop(FIRE_CRACKER_QUEUE, 0);
  }
}
main();
 * */
