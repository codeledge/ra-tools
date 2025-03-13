import {
  List,
  Datagrid,
  TextField,
  DateField,
  ListProps,
  CreateProps,
  SimpleForm,
  Create,
  TextInput,
} from "react-admin";

export const MediaList = (props: ListProps) => (
  <List
    {...props}
    filters={[
      <DateField
        key="createdAt_gte"
        label="Created after"
        source="createdAt_gte"
      />,
    ]}
  >
    <Datagrid>
      <TextField source="id" />
      <TextField source="url" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);

export const MediaCreate = (props: CreateProps) => (
  <Create
    title="New media"
    {...props}
  >
    <SimpleForm>
      <TextInput source="url" />
    </SimpleForm>
  </Create>
);
