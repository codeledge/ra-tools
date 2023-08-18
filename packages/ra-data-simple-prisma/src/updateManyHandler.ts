import { UpdateManyRequest } from "./Http";
import { auditHandler } from "./audit/auditHandler";
import { reduceData, UpdateArgs, UpdateOptions } from "./updateHandler";

export const updateManyHandler = async <Args extends UpdateArgs>(
  req: UpdateManyRequest,
  model: { updateMany: Function },
  options?: Omit<UpdateOptions<Args>, "select" | "include">
) => {
  const { ids } = req.params;

  const data = reduceData(req.params.data, options);

  if (options?.debug) {
    console.log("updateManyHandler:data", data);
  }

  await model.updateMany({
    data,
    where: { id: { in: ids } },
  });

  if (options?.audit) {
    await auditHandler(req, options?.audit);
  }

  //react-admin expects a array of ids as response
  const response = { data: ids };

  return response;
};
