import { FC } from "react";
import { FunctionField, FunctionFieldProps } from "react-admin";
import { JsonField } from "react-admin-json-view";
import get from "lodash/get";

export const ExtendedJsonField: FC<
  Omit<FunctionFieldProps, "render"> & { source: string }
> = ({ source, ...props }) => {
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
