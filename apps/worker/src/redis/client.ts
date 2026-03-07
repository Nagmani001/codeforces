import { createClient, RedisClientType } from "redis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redisClient: RedisClientType = createClient({ url: REDIS_URL });
export const pubSubClient: RedisClientType = createClient({ url: REDIS_URL });
