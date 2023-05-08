import { prismaClient } from "db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userCount = await prismaClient.adminUser.findMany({
    select: { id: true },
  });

  res.json({
    success: true,
    userCount: userCount.length,
  });
}
