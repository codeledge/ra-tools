const mapRowPrimaryKeyToId = <T>(row: T, primaryKey: string): T => {
  if (primaryKey === "id" || row == null || typeof row !== "object") {
    return row;
  }

  const hasIdField = Object.prototype.hasOwnProperty.call(row, "id");
  const existingId = (row as any).id;
  const keyValue = (row as any)[primaryKey];

  if (typeof keyValue === "undefined") {
    return row;
  }

  if (hasIdField && typeof existingId !== "undefined" && existingId !== keyValue) {
    console.warn(`ra-data-simple-prisma: overwriting existing id with value from primaryKey "${primaryKey}"`);
  }

  const { [primaryKey]: _, ...rest } = row as any;

  return {
    ...rest,
    id: keyValue,
  };
};

export const mapPrimaryKeyToId = <T>(data: T, primaryKey: string): T => {
  if (Array.isArray(data)) {
    return data.map((row) => mapRowPrimaryKeyToId(row, primaryKey)) as T;
  }

  return mapRowPrimaryKeyToId(data, primaryKey);
};
