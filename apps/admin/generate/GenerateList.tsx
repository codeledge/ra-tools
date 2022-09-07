import {
  Resource,
  List,
  Datagrid,
  TextField,
  BooleanField,
  DateField,
  NumberField,
  ReferenceField,
} from "react-admin";
import { DMMF } from "@prisma/generator-helper";
import React from "react";
import { FieldType } from "./types";
import { JsonField } from "react-admin-json-view";

export const GenerateList = ({ model }: { model: DMMF.Model }) => {
  return (
    <List>
      <Datagrid rowClick={"show"}>
        {/* <ShowModelFields model={model} /> */}
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
          if (field.kind === "object" && field.relationFromFields?.[0]) {
            return (
              <ReferenceField
                source={field.relationFromFields[0]}
                reference={field.type}
              >
                <TextField source="name" />
              </ReferenceField>
            );
          }
          if (field.kind === "object") {
            return (
              <ReferenceField source={field.name} reference={field.type}>
                <TextField />
              </ReferenceField>
            );
          }
        })}
      </Datagrid>
    </List>
  );
};
