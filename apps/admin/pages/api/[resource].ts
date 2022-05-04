import { prismaWebClient } from "./../../../website/prisma/prismaWebClient";
import type { NextApiRequest, NextApiResponse } from "next";
import { defaultHandler } from "ra-data-simple-prisma";

//this will catch all the requests that are not overridden

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    return defaultHandler(req, res, prismaWebClient);
  } catch (error) {
    res.status(500).send(error);
  }
}
