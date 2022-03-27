import { Response, UpdateRequest } from "./Http";
import { isObject } from "./lib/isObject";

export const updateHandler = async <T extends { update: Function }>(
  req: UpdateRequest,
  res: Response,
  table: T,
  options?: {
    skipFields?: string[]; //i.e. Json fields throw error if null is used in update
  }
) => {
  //Remove relations, allow nested updates one day
  const data = Object.entries(req.body.params.data).reduce(
    (fields, [key, value]) => {
      if (!isObject(value) && !options?.skipFields?.includes(key))
        fields[key] = value;

      return fields;
    },
    {}
  );

  const updated = await table.update({
    where: { id: +req.body.params.id },
    data,
  });

  return res.json({ data: updated });
};
