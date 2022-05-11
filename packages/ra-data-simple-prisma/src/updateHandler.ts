import { Response, UpdateRequest } from "./Http";
import { isObject } from "./lib/isObject";

export type UpdateOptions = {
  skipFields?: string[]; //i.e. Json fields throw error if null is used in update, they would expect {} instead
  allowFields?: string[]; //fields that will not be checked if it's a relationship or not
};

export const updateHandler = async <T extends { update: Function }>(
  req: UpdateRequest,
  res: Response,
  table: T,
  options?: UpdateOptions
) => {
  //Remove relations, allow nested updates one day
  const data = Object.entries(req.body.params.data).reduce(
    (fields, [key, value]) => {
      if (
        (!isObject(value) && !options?.skipFields?.includes(key)) ||
        options?.allowFields?.includes(key)
      )
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
