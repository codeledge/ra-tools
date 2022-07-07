import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler } from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";
import prismaClient from "db";

export default apiHandler(
  async (req: NextApiRequest, res: NextApiResponse, auth) => {
    return await defaultHandler(req, res, prismaClient, {
      getList: { debug: false },
      audit: {
        model: prismaClient.audit,
        authProvider: auth,
        // enabledResources: ["post","category"],
      },
    });
  }
);
