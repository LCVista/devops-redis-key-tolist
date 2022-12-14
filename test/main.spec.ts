import {run} from '../src/main'
import { RedisClientType } from "redis";

const mockClient = {} as RedisClientType;
const mockConnect = jest.fn().mockImplementation(() => {
    return Promise.resolve();
});
mockClient["connect"] = mockConnect;
const mockDisconnect = jest.fn().mockImplementation(() => {
    return Promise.resolve();
});
mockClient["disconnect"] = mockDisconnect;
const mockSet = jest
    .fn()
    .mockImplementation((key: string, value: string) => {});
mockClient["set"] = mockSet;

const mockKeys = jest.fn().mockImplementation((key: string): Array<string> => {
    return [];
});
mockClient["keys"] = mockKeys;

const mockGet = jest.fn().mockImplementation((key: string): string => {
    return "";
});
mockClient["get"] = mockGet;

const mockDel = jest.fn().mockImplementation((key: string) => {});
mockClient["del"] = mockDel;

afterEach( () => {
    mockClient["get"] = mockGet;
})

test("Happy Path, a key with 3 values results in 3 values", async () => {
    // Arrange
    const redisKey = "customers";
    const customerList = "customer1,customer2,customer3"
    const myMockGet = jest.fn().mockImplementation((key: string): string => {
        if (key === redisKey) {
            return customerList;
        } else {
            return "";
        }
    });
    mockClient["get"] = myMockGet;

    // Act
    const result = await run(mockClient as RedisClientType, redisKey);

    // Assert
    expect(result.count).toBe(3);
    expect(result.values.length).toBe(3);
    expect(result.values[0]).toBe("customer1");
    expect(result.values[1]).toBe("customer2");
    expect(result.values[2]).toBe("customer3");
});

test("Happy Path, a key with 0 values results in empty list", async () => {
    // Arrange
    const redisKey = "key-not-exist";

    // Act
    const result = await run(mockClient as RedisClientType, redisKey);

    // Assert
    expect(result.count).toBe(0);
    expect(result.values).toBeDefined();
    expect(result.values.length).toBe(0);
});
