import { DeleteManyRequest, DeleteRequest, Response } from "./Http";

export type DeleteManyOptions = {
  softDeleteField?: string;
};

export const deleteManyHandler = async <
  T extends { updateMany: Function; deleteMany: Function }
>(
  req: DeleteManyRequest,
  res: Response,
  table: T,
  options?: DeleteManyOptions
) => {
  const deleted = options?.softDeleteField
    ? await table.updateMany({
        where: { id: { in: req.body.params.ids } },
        data: {
          [options?.softDeleteField]: new Date(),
        },
      })
    : await table.deleteMany({
        where: { id: { in: req.body.params.ids } },
      });

  //it expects the ids of the deleted rows, but only the count is returned from the deleteMany method
  return res.json({ data: req.body.params.ids });
};
