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
  ReferenceField,
  AutocompleteInput,
  ReferenceInput,
} from "react-admin";
import { AutocompleteFilter } from "../filters/AutocompleteFilter";

export const MediaList = (props: ListProps) => (
  <List
    {...props}
    filters={[
      <AutocompleteFilter
        key={`1`}
        source={"userId"}
        reference={"user"}
        field={"name"}
        alwaysOn
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
  <Create title="New media" {...props}>
    <SimpleForm>
      <TextInput source="url" />
    </SimpleForm>
  </Create>
);
