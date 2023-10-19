import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const apiHandler =
  (handler: (r: NextRequest) => Promise<NextResponse>) =>
  async (r: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(r);
    } catch (error: any) {
      console.error(error);
      return NextResponse.json(
        // TODO: refine stack, it could be shown in react admin error block potentially
        { message: error.message },
        { status: error.status || 500 }
      );
    }
  };
