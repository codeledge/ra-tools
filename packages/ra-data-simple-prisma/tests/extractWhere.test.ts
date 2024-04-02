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
    });
  });
});
