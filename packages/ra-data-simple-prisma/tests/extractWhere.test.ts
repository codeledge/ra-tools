import { GetListRequest } from "../src/Http";
import { ExtractWhereOptions, extractWhere } from "../src/extractWhere";
import { expect, describe, test } from "@jest/globals";

describe("extractWhere", () => {
  test("should extract where", () => {
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
          relationship_some: {
            value_enum: "ENUM",
          },
          other_rel_every: {
            value_startsWith: "startsWith",
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

    const result = extractWhere(req, options);

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
      relationship: {
        some: {
          value_enum: "ENUM",
        },
      },
      other_rel: {
        every: {
          value: {
            startsWith: "startsWith",
            mode: "insensitive",
          },
        },
      },
    });
  });
});
