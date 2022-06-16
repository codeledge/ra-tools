import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import getConfig from "next/config";
import { spawn } from "child_process";
import { processes } from "../../lib/processes";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { serverRuntimeConfig } = getConfig();

  switch (req.body.method) {
    case "getList": {
      const data = Object.entries(processes).map(([id, process]) => ({
        id,
        process,
      }));
      return res.json({
        data,
        total: data.length,
      });
    }
    case "delete": {
      const process = processes[req.body.params.id];

      delete processes[req.body.params.id];
      process.kill("SIGINT");

      res.json({ data: { id: process.pid } });
    }
    case "create": {
      const process = spawn("python3", [
        path.join(
          serverRuntimeConfig.PROJECT_ROOT,
          "./public",
          "scripts",
          req.body.params.data.scriptId
        ),
      ]);

      process.stdout.on("data", (data) => {
        console.log("pattern: ", data.toString());
      });

      process.stderr.on("data", (data) => {
        console.error("err: ", data.toString());
      });

      process.on("error", (error) => {
        console.error("error: ", error.message);
      });

      process.on("close", (code) => {
        console.log("close ", code);
      });

      process.on("exit", (code) => {
        console.log("exit ", code);
        delete processes[req.body.params.data.id];
      });

      console.log(serverRuntimeConfig.PROJECT_ROOT, process.pid);

      processes[req.body.params.data.id] = process;

      return res.json({
        data: {
          id: process.pid,
        },
      });
    }
  }
}
