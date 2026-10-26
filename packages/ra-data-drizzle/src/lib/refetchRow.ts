import type { DrizzleQueryArgs } from "../DrizzleTypes";
import type { DrizzleTable } from "../getTable";
import { compact } from "./compact";

/**
 * Writes return the plain row via `.returning()`;
 * when `columns`/`with`/`extras` are requested the row is re-read with the relational API.
 */
export const refetchRow = async (
  drizzleTable: DrizzleTable,
  row: any,
  primaryKey: string,
  args?: DrizzleQueryArgs,
) => {
  if (!row || (!args?.columns && !args?.with && !args?.extras)) return row;

  return drizzleTable.query.findFirst(
    compact({
      where: { [primaryKey]: { eq: row[primaryKey] } },
      columns: args.columns,
      with: args.with,
      extras: args.extras,
    }),
  );
};
