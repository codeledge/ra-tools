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
  Show,
  SimpleShowLayout,
  ChipField,
  ReferenceManyField,
  SingleFieldList,
} from "react-admin";

export const UserCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

const userFilters = [
  <NumberInput key="1" label="Id (exact)" source="id" alwaysOn />,
  <TextInput key="2" label="Name (contains)" source="name" alwaysOn />,
];

export const UserList = (props: ListProps) => (
  <List {...props} filters={userFilters}>
    <Datagrid rowClick={"show"}>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
      <ReferenceManyField label="Posts" reference="post" target="userId">
        <SingleFieldList>
          <ChipField source="text" />
        </SingleFieldList>
      </ReferenceManyField>
    </Datagrid>
  </List>
);

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </SimpleShowLayout>
  </Show>
);
