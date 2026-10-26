import type { DrizzleTable } from "../getTable";
import { isNotField } from "./isNotField";

export type WriteDataOptions = {
  action: "create" | "update";
  primaryKey: string;
  skipFields?: { [key: string]: boolean };
  allowOnlyFields?: { [key: string]: boolean };
};

/**
 * Keeps only the table columns from the react-admin payload
 * (dropping relations/computed fields sent back from reads)
 * and converts ISO strings to Date for timestamp/date columns in "date" mode.
 */
export const toWriteData = (
  data: Record<string, any>,
  drizzleTable: DrizzleTable,
  options: WriteDataOptions,
) => {
  const { action, primaryKey } = options;

  return Object.entries(data).reduce<Record<string, any>>(
    (fields, [key, value]) => {
      if (primaryKey !== "id" && key === primaryKey) {
        throw new Error(
          `${action}Handler: Field ${key} is reserved when primaryKey is configured; use id and omit the original primary key from writes`,
        );
      }
      if (isNotField(key)) return fields;
      if (action === "create" && value === "") return fields;
      if (options.skipFields?.[key]) return fields;

      const column = drizzleTable.columns[key];

      if (
        options.allowOnlyFields &&
        !options.allowOnlyFields[key] &&
        !(key === "id" && primaryKey !== "id")
      ) {
        throw new Error(
          `${action}Handler: Field ${key} is not allowed in ${action}`,
        );
      }

      // natural keys (e.g. slug) are sent as `id` by react-admin
      if (action === "create" && key === "id" && primaryKey !== "id") {
        fields[primaryKey] = value;
        return fields;
      }

      if (!column) return fields;
      // never rewrite the primary key on update (identity columns would throw)
      if (action === "update" && key === primaryKey) return fields;

      fields[key] =
        column.dataType === "object date" && typeof value === "string"
          ? new Date(value)
          : value;

      return fields;
    },
    {},
  );
};
