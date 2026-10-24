"use client";

import {
  Admin,
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  Edit,
  EditButton,
  List,
  NumberField,
  NumberInput,
  Resource,
  SimpleForm,
  TextField,
  TextInput,
  required,
} from "react-admin";
import { dataProvider } from "ra-data-duckdb";

const usersProvider = dataProvider("/api");

const userFilters = [
  <TextInput key="q" source="q" label="Search" alwaysOn />,
];

const UserList = () => (
  <List filters={userFilters}>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <NumberField source="age" />
      <BooleanField source="active" />
      <EditButton />
    </Datagrid>
  </List>
);

const UserForm = () => (
  <SimpleForm>
    <TextInput source="name" validate={required()} />
    <TextInput source="email" validate={required()} />
    <NumberInput source="age" />
    <BooleanInput source="active" />
  </SimpleForm>
);

const UserCreate = () => (
  <Create>
    <UserForm />
  </Create>
);

const UserEdit = () => (
  <Edit>
    <UserForm />
  </Edit>
);

const AdminApp = () => (
  <Admin dataProvider={usersProvider} disableTelemetry>
    <Resource
      name="users"
      list={UserList}
      create={UserCreate}
      edit={UserEdit}
    />
  </Admin>
);

export default AdminApp;
