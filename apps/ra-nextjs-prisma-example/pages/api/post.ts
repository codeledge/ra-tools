import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler } from "ra-data-simple-prisma";
import { prismaClient } from "../../prisma/prismaClient";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return defaultHandler(req, res, prismaClient);
}
