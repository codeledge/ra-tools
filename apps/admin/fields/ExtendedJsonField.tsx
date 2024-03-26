import { FC } from "react";
import { FunctionField, FunctionFieldProps } from "react-admin";
import { JsonView, defaultStyles } from "react-json-view-lite";
import get from "lodash/get";
import { useTheme } from "@mui/material";
import "react-json-view-lite/dist/index.css";

export const ExtendedJsonField: FC<
  Omit<FunctionFieldProps, "render"> & { source: string; expanded?: boolean }
> = ({ source, expanded, ...props }) => {
  const theme = useTheme();

  return (
    <FunctionField
      render={(record: any) => {
        const value = get(record, source!);

        return (
          <JsonView
            data={typeof value === "string" ? JSON.parse(value) : value}
            style={defaultStyles}
            shouldExpandNode={() => false}
          />
        );
      }}
      {...props}
    />
  );
};
