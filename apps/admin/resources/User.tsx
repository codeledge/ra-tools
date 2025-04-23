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
  ReferenceManyField,
  Show,
  SimpleForm,
  SimpleShowLayout,
  SingleFieldList,
  TextField,
  TextInput,
  useCanAccess,
} from "react-admin";

export const UserCreate = (props: CreateProps) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
    </SimpleForm>
  </Create>
);

const userFilters = [
  <TextInput key="id" label="Id (exact by convention)" source="id" alwaysOn />,
  <TextInput key="name" label="Name (contains)" source="name" alwaysOn />,
  <TextInput
    key="settings.language"
    label="Language (settings)"
    source="settings.language_eq"
    alwaysOn
  />,
];

export const UserList = (props: ListProps) => (
  <List {...props} filters={userFilters}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
      <ReferenceManyField label="Posts" reference="post" target="userId">
        <SingleFieldList>
          <ChipField source="id" /> {/* Figure out somethign smarter */}
        </SingleFieldList>
      </ReferenceManyField>
    </Datagrid>
  </List>
);

export const UserEdit = (props: EditProps) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="settings.language" />
    </SimpleForm>
  </Edit>
);

export const UserShow = () => {
  const canReadCreatedAt = useCanAccess({
    action: "show",
    resource: "adminUser.createdAt",
  });
  const canReadUpdatedAt = useCanAccess({
    action: "show",
    resource: "adminUser.updatedAt",
  });

  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <TextField source="name" />
        <TextField source="settings.language" />
        {canReadCreatedAt.canAccess && <DateField source="createdAt" />}
        {canReadUpdatedAt.canAccess && <DateField source="updatedAt" />}
      </SimpleShowLayout>
    </Show>
  );
};
