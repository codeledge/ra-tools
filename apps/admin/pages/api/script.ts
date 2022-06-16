import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import getConfig from "next/config";
import { spawn } from "child_process";

//this will catch all the requests that are not overridden

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { serverRuntimeConfig } = getConfig();

  switch (req.body.method) {
    case "getList": {
      const dir = path.join(
        serverRuntimeConfig.PROJECT_ROOT,
        "./public",
        "scripts"
      );

      const filenames = fs.readdirSync(dir);

      return res.json({
        data: filenames.map((filename) => {
          return { id: filename };
        }),
        total: filenames.length,
      });
    }
  }
}
