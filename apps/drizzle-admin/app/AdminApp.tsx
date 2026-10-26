"use client";

import {
  Admin,
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditButton,
  List,
  NumberField,
  NumberInput,
  ReferenceField,
  ReferenceInput,
  Resource,
  SelectArrayInput,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  required,
} from "react-admin";
import { dataProvider } from "ra-data-drizzle";

const provider = dataProvider("/api");

const userFilters = [
  <TextInput key="name" source="name@contains" label="Name" alwaysOn />,
  <NumberInput key="age" source="age@gte" label="Age >=" />,
  <BooleanInput key="active" source="isActive@eq" label="Active" />,
];

const UserList = () => (
  <List filters={userFilters}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <NumberField source="age" />
      <BooleanField source="isActive" />
      <DateField source="created_at" />
      <EditButton />
    </Datagrid>
  </List>
);

const UserForm = () => (
  <SimpleForm>
    <TextInput source="name" validate={required()} />
    <TextInput source="email" validate={required()} />
    <NumberInput source="age" />
    <BooleanInput source="isActive" />
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

const postFilters = [
  <TextInput key="title" source="title@contains" label="Title" alwaysOn />,
  <ReferenceInput key="author" source="authorId" reference="users">
    <SelectInput optionText="name" />
  </ReferenceInput>,
  <BooleanInput
    key="published"
    source="publishedAt@isNotNull"
    label="Published"
  />,
];

const PostList = () => (
  <List filters={postFilters}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="tags" />
      <ReferenceField source="authorId" reference="users">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="publishedAt" />
      <DateField source="deletedAt" />
      <EditButton />
    </Datagrid>
  </List>
);

const PostForm = () => (
  <SimpleForm>
    <TextInput source="title" validate={required()} />
    <SelectArrayInput
      source="tags"
      choices={[
        { id: "orm", name: "orm" },
        { id: "sql", name: "sql" },
        { id: "misc", name: "misc" },
      ]}
    />
    <ReferenceInput source="authorId" reference="users">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <DateInput source="publishedAt" />
  </SimpleForm>
);

const PostCreate = () => (
  <Create>
    <PostForm />
  </Create>
);

const PostEdit = () => (
  <Edit>
    <PostForm />
  </Edit>
);

const AdminApp = () => (
  <Admin dataProvider={provider} disableTelemetry>
    <Resource name="users" list={UserList} create={UserCreate} edit={UserEdit} />
    <Resource name="posts" list={PostList} create={PostCreate} edit={PostEdit} />
  </Admin>
);

export default AdminApp;
