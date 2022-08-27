import { DMMF } from "@prisma/generator-helper";
import React from "react";
import {
  TextField,
  BooleanField,
  DateField,
  NumberField,
  Labeled,
} from "react-admin";
import { JsonField } from "react-admin-json-view";
import { FieldType } from "./types";

export const ShowModelFields = ({ model }: { model: DMMF.Model }) => {
  return (
    <>
      {model.fields.map((field) => (
        // <Labeled label="Post title">
        <ShowField key={field.name} field={field} />
        // </Labeled>
      ))}
    </>
  );
};

export const ShowField = ({ field }: { field: DMMF.Field }) => {
  console.log(field);
  const type = field.type as FieldType;
  // if (FIELD_EXLCUDED.includes(field.name)) {
  //   return (
  //     <SimpleShowLayout>
  //       <TextField source={field.name} />
  //     </SimpleShowLayout>
  //   );
  // }
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
  return <></>; //Typography>Unknown {type}</Typography
};
