import {getInput} from "./utils/inputs";
import * as core from '@actions/core';
import { createClient, RedisClientType } from "redis";

export type RunResponse = {
  values: Array<string>,
  count: number
}

export async function run(
    redisClient: RedisClientType,
    redisKey: string
): Promise<RunResponse> {
  await redisClient.connect();
  const value = (await redisClient.get(redisKey)) || "";
  const values = value.trim()
      .split(",")
      .map(v => v.trim())
      .filter(v => v.length > 0)
  return {
    values: values,
    count: values.length
  }
}

/* istanbul ignore next */
if (require.main === module) {
  const redisEndpoint = getInput("redis_endpoint");
  const redisKey = getInput("redis_key");

  console.log(`redisEndpoint = ${redisEndpoint}`);
  console.log(`redisKey = ${redisKey}`);

  if (redisEndpoint === undefined) {
    core.error("redisEndpoint is required");
    process.exit(1);
  }

  if (redisKey === undefined) {
    core.error("redisKey is required");
    process.exit(1);
  }

  const client = createClient({
    url: `redis://${redisEndpoint}`,
  });

  run(
      client as RedisClientType,
      redisKey,
  )
      .then( (result) => {
        core.setOutput("list", JSON.stringify(result.values));
        core.setOutput("count", result.count);
      })
      .catch((e) => {
        throw e;
      });
}
