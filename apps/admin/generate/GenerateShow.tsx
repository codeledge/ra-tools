import {
  Resource,
  List,
  Datagrid,
  TextField,
  Show,
  BooleanField,
  DateField,
  NumberField,
} from "react-admin";
import { DMMF } from "@prisma/generator-helper";
import { SimpleShowLayout } from "react-admin";
import React from "react";
import { JsonField } from "react-admin-json-view";
import { FieldType } from "./types";

export const GenerateShow = ({ model }: { model: DMMF.Model }) => {
  return (
    <Show>
      <SimpleShowLayout>
        {model.fields.map((field) => {
          const type = field.type as FieldType;
          if (field.isReadOnly) {
            return;
          }

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
      </SimpleShowLayout>
    </Show>
  );
};
