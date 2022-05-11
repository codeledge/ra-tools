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

export const TagChild = (props: CreateProps) => (
  <List {...props} filter={{ name: "Gino" }}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);

export const TagList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick={"show"} expand={TagChild} expandSingle>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);
