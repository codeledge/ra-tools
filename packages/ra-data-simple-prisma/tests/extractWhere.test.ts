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
});
