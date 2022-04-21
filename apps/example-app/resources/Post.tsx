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
} from "react-admin";

export const PostList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick={"show"}>
      <TextField source="id" />
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
      <ReferenceArrayInput
        label="Tags"
        reference="tag"
        source="tags.connect.id"
      >
        <AutocompleteArrayInput />
      </ReferenceArrayInput>
    </SimpleForm>
  </Create>
);
