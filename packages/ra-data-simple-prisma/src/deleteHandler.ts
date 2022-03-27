import { DeleteRequest, Response } from "./Http";

export const deleteHandler = async <
  T extends { update: Function; delete: Function }
>(
  req: DeleteRequest,
  res: Response,
  table: T,
  options?: {
    soft?: string;
  }
) => {
  const deleted = options?.soft
    ? await table.update({
        where: { id: +req.body.params.id },
        data: {
          [options?.soft]: new Date(),
        },
      })
    : await table.delete({
        where: { id: +req.body.params.id },
      });

  return res.json({ data: deleted });
};
