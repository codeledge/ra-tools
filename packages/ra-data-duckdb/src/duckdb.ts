/**
 * Minimal DuckDB query surface used by handlers.
 * Pass your own implementation, or wrap `@duckdb/node-api` via `fromDuckDBConnection`.
 */
export type DuckDBExecutor = {
  all: <T = Record<string, unknown>>(
    sql: string,
    params?: Record<string, unknown>,
  ) => Promise<T[]>;
  run: (sql: string, params?: Record<string, unknown>) => Promise<void>;
};

type DuckDBConnectionLike = {
  runAndReadAll: (
    sql: string,
    params?: any,
  ) => Promise<{
    getRowObjectsJson: () => Record<string, unknown>[];
  }>;
  run: (sql: string, params?: any) => Promise<unknown>;
};

/**
 * Wrap a `@duckdb/node-api` DuckDBConnection (or compatible) as a DuckDBExecutor.
 */
export const fromDuckDBConnection = (
  connection: DuckDBConnectionLike,
): DuckDBExecutor => ({
  all: async <T = Record<string, unknown>>(
    sql: string,
    params?: Record<string, unknown>,
  ) => {
    const reader = await connection.runAndReadAll(sql, params);
    return reader.getRowObjectsJson() as T[];
  },
  run: async (sql: string, params?: Record<string, unknown>) => {
    await connection.run(sql, params);
  },
});
