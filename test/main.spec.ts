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

test("Happy Path, a key with 3 values results in 3 values sorted", async () => {
    // Arrange
    const redisKey = "customers";
    const customerList = "customer3,customer1,customer2"
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

test("Happy Path (reverse), a key with 3 values results in 3 values", async () => {
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
    const result = await run(mockClient as RedisClientType, redisKey, true);

    // Assert
    expect(result.count).toBe(3);
    expect(result.values.length).toBe(3);
    expect(result.values[0]).toBe("customer3");
    expect(result.values[1]).toBe("customer2");
    expect(result.values[2]).toBe("customer1");
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

test("Happy Path, 3 values limited to 1 and page 1 returns first", async () => {
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
    const page = 1;
    const limit = 1;

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit);

    // Assert
    expect(result.count).toBe(1);
    expect(result.values.length).toBe(1);
    expect(result.values[0]).toBe("customer1");
});

test("Happy Path, 3 values limited to 4 and page 1 returns all items", async () => {
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
    const page = 1;
    const limit = 4;

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit);

    // Assert
    expect(result.count).toBe(3);
    expect(result.values.length).toBe(3);
    expect(result.values[0]).toBe("customer1");
    expect(result.values[1]).toBe("customer2");
    expect(result.values[2]).toBe("customer3");
});

test("Happy Path, 3 values limited to 2 and page 1 returns first two items", async () => {
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
    const page = 1;
    const limit = 2;

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit);

    // Assert
    expect(result.count).toBe(2);
    expect(result.values.length).toBe(2);
    expect(result.values[0]).toBe("customer1");
    expect(result.values[1]).toBe("customer2");
});

test("Happy Path, 3 values limited to 2 and page undefined returns first two items", async () => {
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
    const page = undefined;
    const limit = 2;

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit);

    // Assert
    expect(result.count).toBe(2);
    expect(result.values.length).toBe(2);
    expect(result.values[0]).toBe("customer1");
    expect(result.values[1]).toBe("customer2");
});

test("Happy Path, 3 values limited to 1 and page 4 returns empty set", async () => {
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
    const page = 4;
    const limit = 1;

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit);

    // Assert
    expect(result.count).toBe(0);
    expect(result.values.length).toBe(0);
});

test("Happy Path, 3 values limited to 5 and page 4 returns empty set", async () => {
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
    const page = 4;
    const limit = 1;

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit);

    // Assert
    expect(result.count).toBe(0);
    expect(result.values.length).toBe(0);
});


test("Happy Path, 3 values limited to 2 and page 2 returns 3rd item", async () => {
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
    const page = 2;
    const limit = 2;

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit);

    // Assert
    expect(result.count).toBe(1);
    expect(result.values.length).toBe(1);
    expect(result.values[0]).toBe("customer3");
});

test("Happy Path (Buckets), 3 values limited to 2 groups and page 2 returns 3rd item", async () => {
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
    const page = undefined;
    const limit = 2;
    const makeGroups = true

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit, makeGroups);

    // Assert
    expect(result.count).toBe(2);
    expect(result.values.length).toBe(2);
    expect(result.values[0]).toBe("customer1,customer2");
    expect(result.values[1]).toBe("customer3");
});

test("Happy Path (Buckets), 0 values limited to 2 groups", async () => {
    // Arrange
    const redisKey = "customers";
    const customerList = ""
    const myMockGet = jest.fn().mockImplementation((key: string): string => {
        if (key === redisKey) {
            return customerList;
        } else {
            return "";
        }
    });
    mockClient["get"] = myMockGet;
    const page = undefined;
    const limit = 2;
    const makeGroups = true

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit, makeGroups);

    // Assert
    expect(result.count).toBe(0);
    expect(result.values.length).toBe(0);
});

test("Happy Path (Buckets), 1 values limited to 2 groups", async () => {
    // Arrange
    const redisKey = "customers";
    const customerList = "customer1"
    const myMockGet = jest.fn().mockImplementation((key: string): string => {
        if (key === redisKey) {
            return customerList;
        } else {
            return "";
        }
    });
    mockClient["get"] = myMockGet;
    const page = undefined;
    const limit = 2;
    const makeGroups = true

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit, makeGroups);

    // Assert
    expect(result.count).toBe(1);
    expect(result.values.length).toBe(1);
    expect(result.values[0]).toBe("customer1");
});

test("Happy Path (Buckets), 4 values limited to 2 groups", async () => {
    // Arrange
    const redisKey = "customers";
    const customerList = "customer1,customer2,customer3,customer4"
    const myMockGet = jest.fn().mockImplementation((key: string): string => {
        if (key === redisKey) {
            return customerList;
        } else {
            return "";
        }
    });
    mockClient["get"] = myMockGet;
    const page = undefined;
    const limit = 2;
    const makeGroups = true

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit, makeGroups);

    // Assert
    expect(result.count).toBe(2);
    expect(result.values.length).toBe(2);
    expect(result.values[0]).toBe("customer1,customer2");
    expect(result.values[1]).toBe("customer3,customer4");
});

test("Happy Path (Buckets), 4 values limited to 5 groups", async () => {
    // Arrange
    const redisKey = "customers";
    const customerList = "customer1,customer2,customer3,customer4"
    const myMockGet = jest.fn().mockImplementation((key: string): string => {
        if (key === redisKey) {
            return customerList;
        } else {
            return "";
        }
    });
    mockClient["get"] = myMockGet;
    const page = undefined;
    const limit = 5;
    const makeGroups = true

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit, makeGroups);

    // Assert
    expect(result.count).toBe(1);
    expect(result.values.length).toBe(1);
    expect(result.values[0]).toBe("customer1,customer2,customer3,customer4");
});

test("Happy Path (Buckets), 11 values limited to 5 groups", async () => {
    // Arrange
    const redisKey = "customers";
    const customerList = "customer1,customer2,customer3,customer4,customer5,customer6,customer7,customer8,customer9,customer10,customer11"
    const myMockGet = jest.fn().mockImplementation((key: string): string => {
        if (key === redisKey) {
            return customerList;
        } else {
            return "";
        }
    });
    mockClient["get"] = myMockGet;
    const page = undefined;
    const limit = 5;
    const makeGroups = true

    // Act
    const result = await run(mockClient as RedisClientType, redisKey, false, page, limit, makeGroups);

    // Assert
    expect(result.count).toBe(3);
    expect(result.values.length).toBe(3);
    expect(result.values[0]).toBe("customer1,customer10,customer11,customer2,customer3");
    expect(result.values[2]).toBe("customer9");
});