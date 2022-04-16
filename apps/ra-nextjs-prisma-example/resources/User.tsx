import {
  List,
  Datagrid,
  TextField,
  DateField,
  ListProps,
  CreateProps,
  Create,
  DateInput,
  SimpleForm,
  TextInput,
  NumberInput,
} from "react-admin";

export const UserCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

const postFilters = [
  <NumberInput key="1" label="Id (exact)" source="id" alwaysOn />,
  <TextInput key="2" label="Name (contains)" source="name" alwaysOn />,
];

export const UserList = (props: ListProps) => (
  <List {...props} filters={postFilters}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);
