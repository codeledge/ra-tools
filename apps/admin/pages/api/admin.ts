import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler } from "ra-data-simple-prisma";
import { apiHandler } from "../../middlewares/apiHandler";
import { prismaAdminClient } from "../../prisma/prismaAdminClient";

export default apiHandler((req: NextApiRequest, res: NextApiResponse) => {
  return defaultHandler(req, res, prismaAdminClient);
});
