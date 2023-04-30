import { NextApiRequest, NextApiResponse } from "next";
import { AuthProvider } from "react-admin";
import { authProvider } from "../providers/authProvider";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";

//API handler, catches all errors and returns them as JSON
export const apiHandler =
  (
    handler: (
      req: NextApiRequest,
      res: NextApiResponse,
      authProviderInstance: AuthProvider
    ) => void
  ) =>
  async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session)
        return res.status(401).json({
          message: "Unauthorized",
        });
      return handler(req, res, authProvider(session));
    } catch (error: any) {
      console.error(error);
      // do this or nextjs will show an entire html error response
      return res.status(error?.status || 500).json({ message: error?.message });
    }
  };
