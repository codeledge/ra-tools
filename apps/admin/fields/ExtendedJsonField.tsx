import { FC } from "react";
import { FunctionField, FunctionFieldProps } from "react-admin";
import ReactJson from "react18-json-view";
import get from "lodash/get";
import { useTheme } from "@mui/material";
import "react18-json-view/src/style.css";

export const ExtendedJsonField: FC<
  Omit<FunctionFieldProps, "render"> & { source: string; expanded?: boolean }
> = ({ source, expanded, ...props }) => {
  const theme = useTheme();

  return (
    <FunctionField
      render={(record: any) => {
        const value = get(record, source!);

        return (
          <ReactJson
            src={typeof value === "string" ? JSON.parse(value) : value}
            collapsed={!expanded}
            theme="vscode"
            enableClipboard={false}
          />
        );
      }}
      {...props}
    />
  );
};
