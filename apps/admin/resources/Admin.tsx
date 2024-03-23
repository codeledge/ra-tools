import {
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit,
  EditProps,
  List,
  ListProps,
  Show,
  SimpleForm,
  SimpleShowLayout,
  SelectInput,
  TextField,
  TextInput,
  EditButton,
} from "react-admin";
import { Role } from "@prisma/client";

export const AdminCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="email" />
    </SimpleForm>
  </Create>
);

export const AdminEdit = (props: EditProps) => (
  <Edit {...props} mutationMode="pessimistic">
    <SimpleForm>
      <TextInput source="name" />
      <SelectInput
        source="role"
        choices={Object.values(Role).map((value) => ({
          id: value,
          name: value,
        }))}
        required
      />
    </SimpleForm>
  </Edit>
);

export const AdminList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <EditButton />
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="email" />
      <TextField source="role" />
      <DateField source="emailVerified" />
      <TextField source="image" />
    </Datagrid>
  </List>
);

export const AdminShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="role" />
      <TextField source="email" />
    </SimpleShowLayout>
  </Show>
);
