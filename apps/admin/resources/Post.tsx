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
  ReferenceInput,
  AutocompleteInput,
  AutocompleteArrayInput,
  ReferenceArrayInput,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  Edit,
  EditProps,
  NumberInput,
  ReferenceField,
} from "react-admin";
import { AutocompleteFilter } from "../filters/AutocompleteFilter";

export const PostList = (props: ListProps) => (
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
    <Datagrid rowClick={"show"}>
      <TextField source="id" />
      <ReferenceField source="userId" reference="user" label="User name">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="text" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
      <ReferenceArrayField label="Tags" reference="tag" source="tags">
        <SingleFieldList>
          <ChipField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
    </Datagrid>
  </List>
);

export const PostCreate = (props: CreateProps) => (
  <Create title="New post" {...props}>
    <SimpleForm>
      <ReferenceInput label="User" source="userId" reference="user">
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <TextInput source="text" />
      <ReferenceArrayInput label="Tags" reference="tag" source="tags">
        <AutocompleteArrayInput />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);

export const PostEdit = (props: EditProps) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="text" />
      <NumberInput disabled source="_tags_count" />
      <ReferenceArrayInput label="Tags" reference="tag" source="tags">
        <AutocompleteArrayInput />
      </ReferenceArrayInput>
    </SimpleForm>
  </Edit>
);
