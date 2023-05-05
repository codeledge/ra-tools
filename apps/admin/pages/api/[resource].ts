import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler, canAccess } from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";
import { prismaClient } from "db";
import { extractAccessObjFromReq } from "../../middlewares/extract";

export default apiHandler(
  async (req: NextApiRequest, res: NextApiResponse, auth) => {
    const access = await extractAccessObjFromReq(req);

    if (!canAccess(access)) {
      return res.status(403).json({
        message:
          "You do not have permission to " +
          access.action +
          " this resource: " +
          access.resource,
      });
    }

    await defaultHandler(req, res, prismaClient, {
      getList: { debug: false },
      audit: {
        model: prismaClient.audit,
        authProvider: auth,
        // enabledResources: ["post","category"],
      },
    });
  }
);
