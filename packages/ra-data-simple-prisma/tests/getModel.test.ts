import { describe, expect, test } from "@jest/globals";
import { getModel } from "../src/getModel";
import type { RaPayload } from "../src/Http";
import type { PrismaClientOrDynamicClientExtension } from "../src/PrismaClientTypes";

const postModel = { name: "post" };
const userModel = { name: "core_person" };

const prismaClient = {
  post: postModel,
  core_person: userModel,
} as unknown as PrismaClientOrDynamicClientExtension;

const makeReq = (resource: string): RaPayload => ({
  method: "getOne",
  resource,
  params: { id: 1 },
});

describe("getModel", () => {
  test("uses the mapped model when the resource is in the map", () => {
    const model = getModel(makeReq("userResource"), prismaClient, {
      userResource: "core_person",
    });
    expect(model).toBe(userModel);
  });

  test("falls back to the resource name when the resource is not in the map", () => {
    const model = getModel(makeReq("post"), prismaClient, {
      userResource: "core_person",
    });
    expect(model).toBe(postModel);
  });

  test("falls back to the resource name when no map is provided", () => {
    const model = getModel(makeReq("post"), prismaClient);
    expect(model).toBe(postModel);
  });

  test("throws when the model name is empty", () => {
    expect(() => getModel(makeReq(""), prismaClient)).toThrow(
      "model name is empty",
    );
  });

  test("throws when the prisma client has no matching model", () => {
    expect(() => getModel(makeReq("unknown"), prismaClient)).toThrow(
      'No model found for "unknown"',
    );
  });
});
