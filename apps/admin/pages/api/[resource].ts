import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler } from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";
import prismaClient from "db";

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return await defaultHandler(req, res, prismaClient, {
    getList: { debug: true },
  });
});
