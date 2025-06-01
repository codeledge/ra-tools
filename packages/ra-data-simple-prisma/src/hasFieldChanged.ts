import { UpdateRequest } from "./Http";
import { RDSPError } from "./RDSPError";

/**
 * Checks if a specific field in the request has changed between previousData and data.
 * Throws an error if the field is not present in either previousData or data (should be null)
 *
 * @param req - The update request containing previousData and data.
 * @param field - The field to check for changes.
 * @param value - Optional value to compare against what the field has changed to
 * @returns true if the field has changed, false otherwise.
 * @throws RDSPError if the field is not present in previousData or data.
 */
export const hasFieldChanged = (
  req: UpdateRequest, // for now, does not support updateMany (how can that be done?)
  field: string,
  value?: any
) => {
  const { previousData, data } = req.params;

  if (previousData[field] === undefined) {
    // To avoid forgetting it in query selects...
    throw new RDSPError(`Field "${field}" cannot be undefined in previousData`);
  }
  if (data[field] === undefined) {
    // To avoid forgetting it in the UI...
    throw new RDSPError(`Field "${field}" cannot be undefined in data`);
  }

  if (previousData[field] !== data[field]) {
    if (value !== undefined) {
      if (data[field] !== value) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  return false;
};
