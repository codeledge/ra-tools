import {
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  List,
  ListProps,
  NumberInput,
  Show,
  ShowProps,
  SimpleForm,
  SimpleShowLayout,
  TextField,
  TextInput,
} from "react-admin";

export const UserCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

export const UserEdit = (props: EditProps) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);
export const UserShow = (props: ShowProps) => (
  <Show {...props}>
    <SimpleShowLayout>
      <TextInput source="name" />
    </SimpleShowLayout>
  </Show>
);
const postFilters = [
  <NumberInput key="1" label="Id (exact)" source="id" alwaysOn />,
  <TextInput key="2" label="Name (contains)" source="name" alwaysOn />,
];

export const UserList = (props: ListProps) => (
  <List {...props} filters={postFilters}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);
