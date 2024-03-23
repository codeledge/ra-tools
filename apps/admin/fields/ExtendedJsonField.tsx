import { FC } from "react";
import { FunctionField, FunctionFieldProps } from "react-admin";
import { JsonField } from "react-admin-json-view";
import get from "lodash/get";
import { isServer } from "deverything";

export const ExtendedJsonField: FC<
  Omit<FunctionFieldProps, "render"> & { source: string }
> = ({ source, ...props }) => {
  if (isServer()) return null; // next not able to compile, seems it uses document under the hood
  return (
    <FunctionField
      render={(record: any) => {
        const value = get(record, source!);

        return (
          <JsonField
            source={source!}
            record={record}
            jsonString={typeof value === "string"}
            reactJsonOptions={{
              name: null,
              collapsed: true,
              enableClipboard: false,
              displayDataTypes: false,
            }}
          />
        );
      }}
      {...props}
    />
  );
};
