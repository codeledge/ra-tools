import { GetListRequest } from "../src/Http";
import { ExtractWhereOptions, extractWhere } from "../src/extractWhere";
import { expect, describe, test } from "@jest/globals";

describe("extractWhere", () => {
  test("should extract where", () => {
    // Arrange
    const req: GetListRequest = {
      method: "getList",
      resource: "resource",
      params: {
        filter: {
          noField: "",
          _underscored: "asd",
          id: "1",
          name: "name",
          nested: {
            field: 3,
          },
          bool: true,
          json_pgjson: {
            field: "value",
          },
          OR: [{ x: 1 }, { x: 2 }, { x: 3 }],
        },
        pagination: {
          page: 1,
          perPage: 10,
        },
        sort: {
          field: "id",
          order: "ASC",
        },
      },
    };

    const options: ExtractWhereOptions = {
      filterMode: "insensitive",
    };

    // Act
    const result = extractWhere(req, options);

    // Assert
    expect(result).toEqual({
      id: "1",
      name: {
        contains: "name",
        mode: "insensitive",
      },
      nested: {
        field: 3,
      },
      bool: true,
      json: {
        equals: "value",
        path: ["field"],
      },
      OR: [{ x: 1 }, { x: 2 }, { x: 3 }],
    });
  });

  test("_trueOnly: adds filter when value is true", () => {
    const req: GetListRequest = {
      method: "getList",
      resource: "test",
      params: {
        filter: {
          my_filter_trueOnly: true,
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    const result = extractWhere(req);

    expect(result).toEqual({
      my_filter: true,
    });
  });

  test("_trueOnly: ignores filter when value is false", () => {
    const req: GetListRequest = {
      method: "getList",
      resource: "test",
      params: {
        filter: {
          has_nudity_trueOnly: false,
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    const result = extractWhere(req);

    expect(result).toEqual({});
  });

  test("_trueOnly: ignores filter when value is null", () => {
    const req: GetListRequest = {
      method: "getList",
      resource: "test",
      params: {
        filter: {
          has_nudity_trueOnly: null,
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    const result = extractWhere(req);

    expect(result).toEqual({});
  });

  test("_trueOnly: ignores filter when value is undefined", () => {
    const req: GetListRequest = {
      method: "getList",
      resource: "test",
      params: {
        filter: {
          has_nudity_trueOnly: undefined,
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    const result = extractWhere(req);

    expect(result).toEqual({});
  });

  test("should extract where with nested OR and operators", () => {
    // Arrange
    const req: GetListRequest = {
      method: "getList",
      resource: "test",
      params: {
        filter: {
          OR: [
            { amount: { gte: 1000 }, status: "APPROVED" },
            { amount: { lt: 500 }, status: "PENDING" },
          ],
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    // Act
    const result = extractWhere(req);

    // Assert
    expect(result).toEqual({
      OR: [
        { amount: { gte: 1000 }, status: "APPROVED" },
        { amount: { lt: 500 }, status: "PENDING" },
      ],
    });
  });

  test("coerces YYYY-MM-DD strings for _gte/_lte date filters", () => {
    const req: GetListRequest = {
      method: "getList",
      resource: "test",
      params: {
        filter: {
          createdAt_gte: "2025-01-02",
          createdAt_lte: "2025-01-31",
          updatedAt_gt: "2025-01-01",
          updatedAt_lt: "2025-02-01",
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    const result = extractWhere(req);

    expect(result).toEqual({
      createdAt: {
        gte: "2025-01-02T00:00:00.000Z",
        lte: "2025-01-31T23:59:59.999Z",
      },
      // exclusive operators take the opposite boundary, so the named day is
      // left out entirely: gt skips all of Jan 1, lt skips all of Feb 1
      updatedAt: {
        gt: "2025-01-01T23:59:59.999Z",
        lt: "2025-02-01T00:00:00.000Z",
      },
    });
  });

  test("coerces YYYY-MM-DD strings for nested date comparison operators", () => {
    const req: GetListRequest = {
      method: "getList",
      resource: "test",
      params: {
        filter: {
          createdAt: {
            gte: "2025-01-02",
            lte: "2025-01-31",
          },
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    const result = extractWhere(req);

    expect(result).toEqual({
      createdAt: {
        gte: "2025-01-02T00:00:00.000Z",
        lte: "2025-01-31T23:59:59.999Z",
      },
    });
  });

  test("leaves non date-only comparison values unchanged", () => {
    const req: GetListRequest = {
      method: "getList",
      resource: "test",
      params: {
        filter: {
          createdAt_gte: "2025-01-02T15:30:00.000Z",
          amount_gte: 1000,
          name_contains: "foo",
        },
        pagination: { page: 1, perPage: 10 },
        sort: { field: "id", order: "ASC" },
      },
    };

    const result = extractWhere(req);

    expect(result).toEqual({
      createdAt: {
        gte: "2025-01-02T15:30:00.000Z",
      },
      amount: {
        gte: 1000,
      },
      name: {
        contains: "foo",
        mode: undefined,
      },
    });
  });
});
