import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkAccess } from "../../auth/checkAccess";
import { RaPayload } from "ra-data-simple-prisma";
import { AuthProvider } from "react-admin";
import { Prisma } from "@prisma/client";

export const apiHandler =
  (
    handler: (
      raPayload: RaPayload,
      options: {
        sessionAuthProvider: AuthProvider;
      }
    ) => Promise<NextResponse>
  ) =>
  async (r: NextRequest): Promise<NextResponse> => {
    try {
      const raPayload: RaPayload<Prisma.ModelName> = await r.json();
      const options = await checkAccess(raPayload);
      return await handler(raPayload, options);
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        // TODO: refine stack, it could be shown in react admin error block potentially
        { message: error.message },
        { status: error.status || 500 }
      );
    }
  };
