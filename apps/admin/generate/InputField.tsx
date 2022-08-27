import { Typography } from "@mui/material";
import { DMMF } from "@prisma/generator-helper";
import React from "react";
import {
  BooleanInput,
  DateInput,
  NumberInput,
  TextField,
  SimpleForm,
  TextInput,
  SimpleShowLayout,
} from "react-admin";
import { FIELD_EXLCUDED } from "./consts";
import { FieldType } from "./types";

export const InputField = ({ field }: { field: DMMF.Field }) => {
  const type = field.type as FieldType;
  if (FIELD_EXLCUDED.includes(field.name)) {
    return (
      <SimpleShowLayout>
        <TextField source={field.name} />
      </SimpleShowLayout>
    );
  }
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
  return <Typography>Unknown {type}</Typography>;
};
