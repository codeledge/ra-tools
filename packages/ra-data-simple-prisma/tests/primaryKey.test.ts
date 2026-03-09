import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { deleteHandler } from "../src/deleteHandler";
import { deleteManyHandler } from "../src/deleteManyHandler";
import { getManyHandler } from "../src/getManyHandler";
import { getOneHandler } from "../src/getOneHandler";
import type { PrismaClientOrDynamicClientExtension } from "../src/PrismaClientTypes";
import { updateHandler } from "../src/updateHandler";
import { updateManyHandler } from "../src/updateManyHandler";

/** Build a minimal mock Prisma model and return it alongside the client stub. */
function makeMockModel() {
  const model = {
    findMany: jest.fn().mockResolvedValue([] as never),
    findUnique: jest.fn().mockResolvedValue({ IrregularPrimaryKeyId: 42, name: "row" } as never),
    create: jest.fn().mockResolvedValue({ IrregularPrimaryKeyId: 42 } as never),
    update: jest.fn().mockResolvedValue({ IrregularPrimaryKeyId: 42 } as never),
    updateMany: jest.fn().mockResolvedValue({ count: 2 } as never),
    delete: jest.fn().mockResolvedValue({ IrregularPrimaryKeyId: 42 } as never),
    deleteMany: jest.fn().mockResolvedValue({ count: 2 } as never),
  };

  const prismaClient = {
    post: model,
  } as unknown as PrismaClientOrDynamicClientExtension;

  return { model, prismaClient };
}

// ─── getManyHandler ───────────────────────────────────────────────────────────

describe("getManyHandler - primaryKey", () => {
  let model: ReturnType<typeof makeMockModel>["model"];
  let prismaClient: PrismaClientOrDynamicClientExtension;

  beforeEach(() => {
    ({ model, prismaClient } = makeMockModel());
  });

  test("defaults to `id` when no primaryKey option is given", async () => {
    await getManyHandler({ method: "getMany", resource: "post", params: { ids: [1, 2] } }, prismaClient);
    expect(model.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: [1, 2] } } }));
  });

  test("uses a custom primaryKey in the WHERE clause", async () => {
    await getManyHandler({ method: "getMany", resource: "post", params: { ids: [1, 2] } }, prismaClient, {
      primaryKey: "IrregularPrimaryKeyId",
    });
    expect(model.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { IrregularPrimaryKeyId: { in: [1, 2] } } }),
    );
  });
});

// ─── getOneHandler ────────────────────────────────────────────────────────────

describe("getOneHandler - primaryKey", () => {
  let model: ReturnType<typeof makeMockModel>["model"];
  let prismaClient: PrismaClientOrDynamicClientExtension;

  beforeEach(() => {
    ({ model, prismaClient } = makeMockModel());
  });

  test("defaults to `id` when no primaryKey option is given", async () => {
    await getOneHandler({ method: "getOne", resource: "post", params: { id: 42 } }, prismaClient);
    expect(model.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 42 } }));
  });

  test("uses a custom primaryKey in the WHERE clause", async () => {
    await getOneHandler({ method: "getOne", resource: "post", params: { id: 42 } }, prismaClient, {
      primaryKey: "IrregularPrimaryKeyId",
    });
    expect(model.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { IrregularPrimaryKeyId: 42 } }));
  });
});

// ─── deleteHandler ────────────────────────────────────────────────────────────

describe("deleteHandler - primaryKey", () => {
  let model: ReturnType<typeof makeMockModel>["model"];
  let prismaClient: PrismaClientOrDynamicClientExtension;

  beforeEach(() => {
    ({ model, prismaClient } = makeMockModel());
  });

  test("defaults to `id` when no primaryKey option is given", async () => {
    await deleteHandler(
      {
        method: "delete",
        resource: "post",
        params: { id: 42, previousData: { id: 42 } },
      },
      prismaClient,
    );
    expect(model.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 42 } }));
  });

  test("uses a custom primaryKey in the WHERE clause", async () => {
    await deleteHandler(
      {
        method: "delete",
        resource: "post",
        params: { id: 42, previousData: { id: 42 } },
      },
      prismaClient,
      { primaryKey: "IrregularPrimaryKeyId" },
    );
    expect(model.delete).toHaveBeenCalledWith(expect.objectContaining({ where: { IrregularPrimaryKeyId: 42 } }));
  });

  test("uses a custom primaryKey with softDeleteField", async () => {
    await deleteHandler(
      {
        method: "delete",
        resource: "post",
        params: { id: 42, previousData: { id: 42 } },
      },
      prismaClient,
      { primaryKey: "IrregularPrimaryKeyId", softDeleteField: "deletedAt" },
    );
    expect(model.update).toHaveBeenCalledWith(expect.objectContaining({ where: { IrregularPrimaryKeyId: 42 } }));
  });
});

// ─── deleteManyHandler ────────────────────────────────────────────────────────

describe("deleteManyHandler - primaryKey", () => {
  let model: ReturnType<typeof makeMockModel>["model"];
  let prismaClient: PrismaClientOrDynamicClientExtension;

  beforeEach(() => {
    ({ model, prismaClient } = makeMockModel());
  });

  test("defaults to `id` when no primaryKey option is given", async () => {
    await deleteManyHandler({ method: "deleteMany", resource: "post", params: { ids: [1, 2] } }, prismaClient);
    expect(model.deleteMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: [1, 2] } } }));
  });

  test("uses a custom primaryKey in the WHERE clause", async () => {
    await deleteManyHandler({ method: "deleteMany", resource: "post", params: { ids: [1, 2] } }, prismaClient, {
      primaryKey: "IrregularPrimaryKeyId",
    });
    expect(model.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { IrregularPrimaryKeyId: { in: [1, 2] } } }),
    );
  });

  test("uses a custom primaryKey with softDeleteField", async () => {
    await deleteManyHandler({ method: "deleteMany", resource: "post", params: { ids: [1, 2] } }, prismaClient, {
      primaryKey: "IrregularPrimaryKeyId",
      softDeleteField: "deletedAt",
    });
    expect(model.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { IrregularPrimaryKeyId: { in: [1, 2] } } }),
    );
  });
});

// ─── updateHandler ────────────────────────────────────────────────────────────

describe("updateHandler - primaryKey", () => {
  let model: ReturnType<typeof makeMockModel>["model"];
  let prismaClient: PrismaClientOrDynamicClientExtension;

  beforeEach(() => {
    ({ model, prismaClient } = makeMockModel());
  });

  test("defaults to `id` when no primaryKey option is given", async () => {
    await updateHandler(
      {
        method: "update",
        resource: "post",
        params: { id: 42, data: { name: "updated" }, previousData: { id: 42 } },
      },
      prismaClient,
    );
    expect(model.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 42 } }));
  });

  test("uses a custom primaryKey in the WHERE clause", async () => {
    await updateHandler(
      {
        method: "update",
        resource: "post",
        params: { id: 42, data: { name: "updated" }, previousData: { id: 42 } },
      },
      prismaClient,
      { primaryKey: "IrregularPrimaryKeyId" },
    );
    expect(model.update).toHaveBeenCalledWith(expect.objectContaining({ where: { IrregularPrimaryKeyId: 42 } }));
  });
});

// ─── updateManyHandler ────────────────────────────────────────────────────────

describe("updateManyHandler - primaryKey", () => {
  let model: ReturnType<typeof makeMockModel>["model"];
  let prismaClient: PrismaClientOrDynamicClientExtension;

  beforeEach(() => {
    ({ model, prismaClient } = makeMockModel());
  });

  test("defaults to `id` when no primaryKey option is given", async () => {
    await updateManyHandler(
      {
        method: "updateMany",
        resource: "post",
        params: { ids: [1, 2], data: { published: true } },
      },
      prismaClient,
    );
    expect(model.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: [1, 2] } } }));
  });

  test("uses a custom primaryKey in the WHERE clause", async () => {
    await updateManyHandler(
      {
        method: "updateMany",
        resource: "post",
        params: { ids: [1, 2], data: { published: true } },
      },
      prismaClient,
      { primaryKey: "IrregularPrimaryKeyId" },
    );
    expect(model.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { IrregularPrimaryKeyId: { in: [1, 2] } } }),
    );
  });
});
