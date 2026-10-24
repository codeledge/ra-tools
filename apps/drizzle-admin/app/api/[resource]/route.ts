import { NextResponse } from "next/server";
import { defaultHandler } from "ra-data-drizzle/server";
import { auditLogs, getDatabase } from "../../db";

export const runtime = "nodejs";

const authProvider = {
  getIdentity: async () => ({ id: "demo-admin", fullName: "Demo Admin" }),
};

const handler = async (request: Request) => {
  try {
    const payload = await request.json();
    const db = await getDatabase();

    const result = await defaultHandler(payload, db, {
      audit: {
        table: auditLogs,
        authProvider: authProvider as any,
      },
      getList: {
        // server side constraints are ANDed with client filters
        // where: { deletedAt: { isNull: true } },
      },
      ...(payload.resource === "posts"
        ? { delete: { softDeleteField: "deletedAt" } }
        : {}),
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ message }, { status: 400 });
  }
};

export { handler as POST };
