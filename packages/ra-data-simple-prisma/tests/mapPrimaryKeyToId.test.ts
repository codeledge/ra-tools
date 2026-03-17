import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { mapPrimaryKeyToId } from "../src/mapPrimaryKeyToId";

describe("mapPrimaryKeyToId", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns data unchanged when primaryKey is id", () => {
    const row = { id: 42, title: "Post" };

    const result = mapPrimaryKeyToId(row, "id");

    expect(result).toBe(row);
  });

  test("returns null and primitive values unchanged", () => {
    expect(mapPrimaryKeyToId(null, "IrregularPrimaryKeyId")).toBeNull();
    expect(mapPrimaryKeyToId("value", "IrregularPrimaryKeyId")).toBe("value");
    expect(mapPrimaryKeyToId(42, "IrregularPrimaryKeyId")).toBe(42);
  });

  test("returns row unchanged when configured primary key is missing", () => {
    const row = { id: 7, title: "Post" };

    const result = mapPrimaryKeyToId(row, "IrregularPrimaryKeyId");

    expect(result).toBe(row);
  });

  test("logs a warning when mapping overwrites an existing id", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = mapPrimaryKeyToId({ id: 10, IrregularPrimaryKeyId: 42 }, "IrregularPrimaryKeyId");

    expect(result).toMatchObject({ id: 42 });
    expect(result).not.toHaveProperty("IrregularPrimaryKeyId");
    expect(warnSpy).toHaveBeenCalledWith(
      'ra-data-simple-prisma: overwriting existing id with value from primaryKey "IrregularPrimaryKeyId"',
    );
  });

  test("does not log when existing id already matches mapped primary key", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = mapPrimaryKeyToId({ id: 42, IrregularPrimaryKeyId: 42 }, "IrregularPrimaryKeyId");

    expect(result).toMatchObject({ id: 42 });
    expect(result).not.toHaveProperty("IrregularPrimaryKeyId");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test("does not log when there is no existing id field", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const result = mapPrimaryKeyToId({ IrregularPrimaryKeyId: 42 }, "IrregularPrimaryKeyId");

    expect(result).toMatchObject({ id: 42 });
    expect(result).not.toHaveProperty("IrregularPrimaryKeyId");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test("maps arrays of rows", () => {
    const result = mapPrimaryKeyToId(
      [
        { IrregularPrimaryKeyId: 1, title: "First" },
        { IrregularPrimaryKeyId: 2, title: "Second" },
      ],
      "IrregularPrimaryKeyId",
    );

    expect(result).toEqual([
      { id: 1, title: "First" },
      { id: 2, title: "Second" },
    ]);
  });
});
