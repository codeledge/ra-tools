import { extractOrderBy } from "../src/extractOrderBy";
import { extractWhere, filterToWhere, mergeWhere } from "../src/extractWhere";
import type { GetListRequest } from "../src/Http";

const listReq = (
  filter: any,
  sort?: GetListRequest["params"]["sort"],
): GetListRequest => ({
  method: "getList",
  resource: "posts",
  params: { filter, sort, pagination: { page: 1, perPage: 10 } },
});

describe("extractWhere", () => {
  describe("@ drizzle operators pass through", () => {
    it.each([
      ["eq", 1],
      ["ne", 1],
      ["gt", 1],
      ["gte", 1],
      ["lt", 1],
      ["lte", 1],
      ["like", "a%"],
      ["ilike", "a%"],
      ["notLike", "a%"],
      ["notIlike", "a%"],
    ])("%s", (operator, value) => {
      expect(extractWhere(listReq({ [`age@${operator}`]: value }))).toEqual({
        age: { [operator]: value },
      });
    });

    it.each([
      "in",
      "notIn",
      "arrayContains",
      "arrayOverlaps",
      "arrayContained",
    ])("%s wraps scalars into arrays", (operator) => {
      expect(filterToWhere({ [`tags@${operator}`]: ["a", "b"] })).toEqual({
        tags: { [operator]: ["a", "b"] },
      });
      expect(filterToWhere({ [`tags@${operator}`]: "a" })).toEqual({
        tags: { [operator]: ["a"] },
      });
    });

    it("isNull / isNotNull accept booleans", () => {
      expect(filterToWhere({ "deletedAt@isNull": true })).toEqual({
        deletedAt: { isNull: true },
      });
      expect(filterToWhere({ "deletedAt@isNull": false })).toEqual({
        deletedAt: { isNotNull: true },
      });
      expect(filterToWhere({ "deletedAt@isNotNull": true })).toEqual({
        deletedAt: { isNotNull: true },
      });
      expect(filterToWhere({ "deletedAt@isNotNull": false })).toEqual({
        deletedAt: { isNull: true },
      });
    });

    it("eq/ne with null become isNull/isNotNull", () => {
      expect(filterToWhere({ "authorId@eq": null })).toEqual({
        authorId: { isNull: true },
      });
      expect(filterToWhere({ "authorId@ne": null })).toEqual({
        authorId: { isNotNull: true },
      });
    });

    it("merges operators on the same column (ranges)", () => {
      expect(filterToWhere({ "age@gte": 18, "age@lt": 65 })).toEqual({
        age: { gte: 18, lt: 65 },
      });
    });

    it("works with snake_case columns without ambiguity", () => {
      expect(
        filterToWhere({ created_at: "x", "is_in_stock@eq": true, has_in: 3 }),
      ).toEqual({
        created_at: { ilike: "%x%" },
        is_in_stock: { eq: true },
        has_in: { eq: 3 },
      });
    });

    it("throws on unknown operators and RAW", () => {
      expect(() => filterToWhere({ "age@foo": 1 })).toThrow(
        'Unsupported filter operator "foo"',
      );
      expect(() => filterToWhere({ "age@RAW": 1 })).toThrow();
      expect(() => filterToWhere({ RAW: "1=1" })).toThrow(/RAW/);
    });
  });

  describe("aliases", () => {
    it("contains / startsWith / endsWith with escaping", () => {
      expect(
        filterToWhere({
          "title@contains": "50%_off",
          "name@startsWith": "Al",
          "email@endsWith": "@example.com",
        }),
      ).toEqual({
        title: { ilike: "%50\\%\\_off%" },
        name: { ilike: "Al%" },
        email: { ilike: "%@example.com" },
      });
    });

    it("filterMode default uses like", () => {
      expect(
        filterToWhere(
          { "title@contains": "a", name: "b" },
          { filterMode: "default" },
        ),
      ).toEqual({ title: { like: "%a%" }, name: { like: "%b%" } });
    });

    it("exact", () => {
      expect(filterToWhere({ "title@exact": "Hello" })).toEqual({
        title: { eq: "Hello" },
      });
      expect(filterToWhere({ "title@exact": null })).toEqual({
        title: { isNull: true },
      });
    });

    it("pgjson and search become RAW conditions at their own filter level", () => {
      // a single raw condition is the whole filter
      const single = filterToWhere({ "meta@pgjson": { a: 1 } });
      expect(typeof single.RAW).toBe("function");

      // mixed raw + normal conditions are ANDed at the same level
      const mixed = filterToWhere({
        "meta@pgjson": { a: 1 },
        "body@search": "drizzle",
        name: "al",
      });
      expect(mixed.AND).toHaveLength(3);
      expect(mixed.AND[0]).toEqual({ name: { ilike: "%al%" } });
      expect(typeof mixed.AND[1].RAW).toBe("function");
      expect(typeof mixed.AND[2].RAW).toBe("function");
    });

    it("raw conditions inside OR / NOT / relation filters stay inside", () => {
      const orWhere = filterToWhere({
        OR: [{ "meta@pgjson": { a: 1 } }, { "name@eq": "x" }],
      });
      expect(orWhere.AND).toBeUndefined();
      expect(orWhere.OR).toHaveLength(2);
      expect(typeof orWhere.OR[0].RAW).toBe("function");
      expect(orWhere.OR[1]).toEqual({ name: { eq: "x" } });

      const notWhere = filterToWhere({ NOT: { "meta@pgjson": { a: 1 } } });
      expect(typeof notWhere.NOT.RAW).toBe("function");

      const relWhere = filterToWhere({
        author: { "meta@pgjson": { plan: "pro" }, name: "al" },
      });
      expect(relWhere.author).toMatchObject({ name: { ilike: "%al%" } });
      expect(relWhere.author.AND).toHaveLength(1);
      expect(typeof relWhere.author.AND[0].RAW).toBe("function");
    });
  });

  describe("bare fields", () => {
    it("applies react-admin friendly defaults", () => {
      expect(
        filterToWhere({
          title: "hello",
          age: 3,
          isActive: false,
          authorId: "abc",
          user_id: "def",
          id: "1",
          deletedAt: null,
          status: ["a", "b"],
        }),
      ).toEqual({
        title: { ilike: "%hello%" },
        age: { eq: 3 },
        isActive: { eq: false },
        authorId: { eq: "abc" },
        user_id: { eq: "def" },
        id: { eq: "1" },
        deletedAt: { isNull: true },
        status: { in: ["a", "b"] },
      });
    });

    it("skips empty strings, undefined, underscored and q", () => {
      expect(
        filterToWhere({ title: "", age: undefined, _helper: 1, q: "x" }),
      ).toEqual({});
    });

    it("nested objects become relation filters, with @ inside", () => {
      expect(filterToWhere({ author: { name: "al", "age@gte": 30 } })).toEqual({
        author: { name: { ilike: "%al%" }, age: { gte: 30 } },
      });
    });

    it("dotted paths become relation filters", () => {
      expect(filterToWhere({ "author.name@eq": "Alice" })).toEqual({
        author: { name: { eq: "Alice" } },
      });
    });

    it("OR / AND / NOT are converted recursively", () => {
      expect(
        filterToWhere({
          OR: [{ "age@gte": 40 }, { name: "bo" }, { title: "" }],
          NOT: { "isActive@eq": false },
        }),
      ).toEqual({
        OR: [{ age: { gte: 40 } }, { name: { ilike: "%bo%" } }],
        NOT: { isActive: { eq: false } },
      });
    });
  });
});

describe("mergeWhere", () => {
  it("ANDs non empty wheres", () => {
    expect(mergeWhere({}, undefined, null)).toBeUndefined();
    expect(mergeWhere({ a: 1 }, {})).toEqual({ a: 1 });
    expect(mergeWhere({ a: 1 }, { b: 2 })).toEqual({
      AND: [{ a: 1 }, { b: 2 }],
    });
  });
});

describe("extractOrderBy", () => {
  it("lowercases the order", () => {
    expect(
      extractOrderBy(listReq({}, { field: "title", order: "DESC" })),
    ).toEqual({
      title: "desc",
    });
    expect(
      extractOrderBy(listReq({}, { field: "title", order: "ASC" })),
    ).toEqual({
      title: "asc",
    });
  });

  it("ignores relation and underscored fields", () => {
    expect(
      extractOrderBy(listReq({}, { field: "author.name", order: "ASC" })),
    ).toBeUndefined();
    expect(
      extractOrderBy(listReq({}, { field: "_count", order: "ASC" })),
    ).toBeUndefined();
  });
});
