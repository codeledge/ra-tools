import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler } from "ra-data-simple-prisma";
import { prismaAdminClient } from "../../prisma/prismaAdminClient";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return defaultHandler(req, res, prismaAdminClient);
}
