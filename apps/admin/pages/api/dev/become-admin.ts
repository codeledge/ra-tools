import { prismaClient } from "db";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

//for demo purposes only, please don't use this in production
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  await prismaClient.adminUser.update({
    where: { id: session?.userId },
    data: { role: "OWNER" },
  });

  res.redirect("/api/auth/signout");
}
