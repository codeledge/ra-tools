import { dataHandler } from "./dataHandler";

export const endpointHandler = async (req, res, prisma) => {
  const response = await dataHandler(req.body, prisma);

  res.json(response);
};
