import {
  List,
  Datagrid,
  TextField,
  DateField,
  ListProps,
  CreateProps,
  Create,
  SimpleForm,
  TextInput,
} from "react-admin";

export const TagCreate = (props: CreateProps) => (
  <Create title="New tag" {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

export const TagList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick={"show"}>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);
