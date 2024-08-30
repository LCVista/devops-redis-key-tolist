import {getInput, getInputBoolean, getInputNumber} from "./utils/inputs";
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
    makePagesNotGroups: boolean = false,
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

  if (limit) {
    if (makePagesNotGroups) {

      // Intentionally going in order vs a reducer with bucketing
      // so that the sets remain in order
      let returnValues: string[] = []
      let i = 0;
      let itemsInBucket = 1
      if (limit !== 0) {
        itemsInBucket = Math.ceil(values.length / limit);
      }
      for ( ; i < values.length ; i+=itemsInBucket){
        let subset= values.slice(i, i + itemsInBucket)
        returnValues.push ( subset.join(',') );
      }
      //let subset = values.slice(i)
      //returnValues.push ( subset.join(',') );

      values = returnValues

    } else {
      let pageAsIndex = (page || 1) - 1;
      values = values.slice(pageAsIndex * limit, (pageAsIndex * limit) + limit)
    }
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
  const page = getInputNumber("page");
  const limit = getInputNumber("limit");
  const makePagesNotGroups = getInputBoolean("make_groups_not_pages");

  console.log(`redisEndpoint = ${redisEndpoint}`);
  console.log(`redisKey = ${redisKey}`);
  console.log(`limit = ${limit}`);
  console.log(`page = ${page}`);
  console.log(`makePagesNotGroups = ${makePagesNotGroups}`);

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
      makePagesNotGroups
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
