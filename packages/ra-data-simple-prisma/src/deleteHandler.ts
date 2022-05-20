import { DeleteRequest, Response } from "./Http";

export type DeleteOptions = {
  softDeleteField?: string;
};

export const deleteHandler = async <
  T extends { update: Function; delete: Function }
>(
  req: DeleteRequest,
  res: Response,
  table: T,
  options?: DeleteOptions
) => {
  const { id } = req.body.params;

  const deleted = options?.softDeleteField
    ? await table.update({
        where: { id },
        data: {
          [options?.softDeleteField]: new Date(),
        },
      })
    : await table.delete({
        where: { id },
      });

  return res.json({ data: deleted });
};
