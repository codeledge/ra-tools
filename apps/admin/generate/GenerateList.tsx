import {
  Resource,
  List,
  Datagrid,
  TextField,
  BooleanField,
  DateField,
  NumberField,
} from "react-admin";
import { DMMF } from "@prisma/generator-helper";
import React from "react";
import { ShowField, ShowModelFields } from "./ShowField";
import { FieldType } from "./types";
import { JsonField } from "react-admin-json-view";

export const GenerateList = ({ model }: { model: DMMF.Model }) => {
  return (
    <List>
      <Datagrid rowClick={"show"}>
        {/* <ShowModelFields model={model} /> */}
        {model.fields.map((field) => {
          const type = field.type as FieldType;

          if (type === "String") {
            return <TextField source={field.name} />;
          }
          if (type === "Boolean") {
            return <BooleanField key={field.name} source={field.name} />;
          }
          if (type === "DateTime") {
            return <DateField key={field.name} source={field.name} />;
          }
          if (type === "Int") {
            return <NumberField key={field.name} source={field.name} />;
          }
          if (type === "JSON") {
            return <JsonField key={field.name} source={field.name} />;
          }
        })}
      </Datagrid>
    </List>
  );
};
