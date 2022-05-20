import {
  ChipField,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  List,
  ListProps,
  NumberInput,
  ReferenceManyField,
  Show,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
} from "react-admin";

export const AdminCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="email" />
    </SimpleForm>
  </Create>
);

export const AdminList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <DateField source="emailVerified" />
      <TextField source="image" />
    </Datagrid>
  </List>
);

export const AdminShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
    </SimpleShowLayout>
  </Show>
);
