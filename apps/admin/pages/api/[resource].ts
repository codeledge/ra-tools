import { prismaWebClient } from "./../../../website/prisma/prismaWebClient";
import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler } from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";

export default apiHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return await defaultHandler(req, res, prismaWebClient);
});
