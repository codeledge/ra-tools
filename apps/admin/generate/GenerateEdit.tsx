import {
  Resource,
  List,
  Datagrid,
  TextField,
  Show,
  Edit,
  SimpleForm,
  TextInput,
  BooleanField,
  DateField,
  NumberField,
  BooleanInput,
  DateInput,
  NumberInput,
  AutocompleteInput,
  ReferenceInput,
  AutocompleteArrayInput,
  ReferenceArrayInput,
} from "react-admin";
import { DMMF } from "@prisma/generator-helper";
import { SimpleShowLayout } from "react-admin";
import React from "react";
import { InputField } from "./InputField";
import { JsonField, JsonInput } from "react-admin-json-view";
import { FieldType } from "./types";

export const GenerateEdit = ({ model }: { model: DMMF.Model }) => {
  return (
    <Edit>
      <SimpleForm>
        {model.fields.map((field) => {
          if (field.isReadOnly || field.isUpdatedAt) {
            return;
          }
          const type = field.type as FieldType;

          if (type === "String") {
            return <TextInput source={field.name} />;
          }
          if (type === "Boolean") {
            return <BooleanInput key={field.name} source={field.name} />;
          }
          if (type === "DateTime") {
            return <DateInput key={field.name} source={field.name} />;
          }
          if (type === "Int") {
            return <NumberInput key={field.name} source={field.name} />;
          }
          if (type === "JSON") {
            return <JsonInput key={field.name} source={field.name} />;
          } else if (field.kind === "object" && field.relationFromFields?.[0]) {
            return (
              <ReferenceInput
                source={field.relationFromFields[0]}
                reference={field.type}
              >
                <AutocompleteInput optionText="name" />
              </ReferenceInput>
            );
          } else if (field.kind === "object") {
            return (
              <ReferenceArrayInput source={field.name} reference={field.type}>
                <AutocompleteArrayInput />
              </ReferenceArrayInput>
            );
          }

          return (
            <>
              Unknown {field.name} {type}
            </>
          );
        })}
      </SimpleForm>
    </Edit>
  );
};
