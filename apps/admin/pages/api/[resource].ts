import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler } from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";
import prismaClient from "db";
import { getSession } from "next-auth/react";
import { authProvider } from "../../providers/authProvider";

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });
  return await defaultHandler(req, res, prismaClient, {
    getList: { debug: false },
    audit: { model: prismaClient.log, authProvider: authProvider(session) },
  });
});
