import { canAccess } from "./canAccess";
import { Permission } from "./types";

describe("canAccess", () => {
  const mockPermissions: Permission<string>[] = [
    {
      type: "allow",
      resource: "users",
      action: "list",
    },
    {
      type: "deny",
      resource: "users",
      action: "delete",
    },
    {
      type: "allow",
      resource: "posts",
      action: "*",
    },
    {
      type: "allow",
      resource: "comments",
      action: ["create", "edit"],
    },
  ];

  it("should return false when no permissions are provided", () => {
    expect(
      canAccess({
        action: "list",
        permissions: [],
        resource: "users",
      })
    ).toBe(false);
  });

  it("should allow access when matching allow permission exists", () => {
    expect(
      canAccess({
        action: "list",
        permissions: mockPermissions,
        resource: "users",
      })
    ).toBe(true);
  });

  it("should deny access when matching deny permission exists", () => {
    expect(
      canAccess({
        action: "delete",
        permissions: mockPermissions,
        resource: "users",
      })
    ).toBe(false);
  });

  it("should handle wildcard actions", () => {
    expect(
      canAccess({
        action: "list",
        permissions: mockPermissions,
        resource: "posts",
      })
    ).toBe(true);

    expect(
      canAccess({
        action: "delete",
        permissions: mockPermissions,
        resource: "posts",
      })
    ).toBe(true);
  });

  it("should handle array of actions", () => {
    expect(
      canAccess({
        action: "create",
        permissions: mockPermissions,
        resource: "comments",
      })
    ).toBe(true);

    expect(
      canAccess({
        action: "edit",
        permissions: mockPermissions,
        resource: "comments",
      })
    ).toBe(true);

    expect(
      canAccess({
        action: "delete",
        permissions: mockPermissions,
        resource: "comments",
      })
    ).toBe(false);
  });

  it("should handle record conditions", () => {
    const permissionsWithRecord: Permission<string>[] = [
      {
        type: "allow",
        resource: "users",
        action: "edit",
        record: { id: 1 },
      },
    ];

    expect(
      canAccess({
        action: "edit",
        permissions: permissionsWithRecord,
        resource: "users",
        record: { id: 1 },
      })
    ).toBe(true);

    expect(
      canAccess({
        action: "edit",
        permissions: permissionsWithRecord,
        resource: "users",
        record: { id: 2 },
      })
    ).toBe(false);
  });

  it("should handle field conditions", () => {
    const permissionsWithField: Permission<string>[] = [
      {
        type: "allow",
        resource: "users",
        action: "edit",
        field: "name",
      },
    ];

    expect(
      canAccess({
        action: "edit",
        permissions: permissionsWithField,
        resource: "users",
        field: "name",
      })
    ).toBe(true);

    expect(
      canAccess({
        action: "edit",
        permissions: permissionsWithField,
        resource: "users",
        field: "email",
      })
    ).toBe(false);
  });
});
