import {getInput, getInputNumber} from "./utils/inputs";
import * as core from '@actions/core';
import { createClient, RedisClientType } from "redis";

export type RunResponse = {
  values: string[],
  count: number
}

export async function run(
    redisClient: RedisClientType,
    redisKey: string,
    reverse: boolean = false,
    page: number | undefined = undefined,
    limit: number | undefined = undefined,
): Promise<RunResponse> {
  console.log("Connecting to redis");
  await redisClient.connect();
  console.log("Getting key " + redisKey);
  const value = (await redisClient.get(redisKey)) || "";
  console.log("Got value " + value);
  let values = value.trim()
      .split(",")
      .filter( v => !!v )
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .sort()

  if (page && limit) {
    let pageAsIndex = page-1;
    values = values.slice(pageAsIndex * limit, (pageAsIndex * limit) + limit)
  }

  console.log("Returning # values" + values.length);
  if (reverse) {
    return {
      values: values.reverse(),
      count: values.length
    }
  } else {
    return {
      values: values,
      count: values.length
    }
  }
}

/* istanbul ignore next */
if (require.main === module) {
  const redisEndpoint = getInput("redis_endpoint");
  const redisKey = getInput("redis_key");
  const pageStr = getInput("page");
  const page = getInputNumber("page");
  const limitStr = getInput("limit");
  const limit = getInputNumber("limit");

  console.log(`redisEndpoint = ${redisEndpoint}`);
  console.log(`redisKey = ${redisKey}`);
  console.log(`limit = ${limit}`);
  console.log(`page = ${page}`);
  console.log(`limitStr = ${limitStr}`);
  console.log(`pageStr = ${pageStr}`);

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
      false,
      page,
      limit,
  )
      .then( (result) => {
        console.log("Got response", result);
        core.setOutput("list", result.values);
        core.setOutput("count", result.count);
        //console.log(`::set-output name=list::${JSON.stringify(result.values)}`)
        //console.log(`::set-output name=count::${result.count}`)
        process.exit(0);
      })
      .catch((e) => {
        console.log("Caught error", e);
        process.exit(1);
      });
}
