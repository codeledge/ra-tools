import { Typography } from "@mui/material";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ListProps,
  CreateProps,
  useRecordContext,
  AutocompleteInput,
  Create,
  ReferenceInput,
  SimpleForm,
  TextInput,
  ListBase,
  Edit,
  EditProps,
} from "react-admin";

export const CategoryCreate = (props: CreateProps) => {
  return (
    <Create {...props}>
      <SimpleForm>
        <ReferenceInput
          label="Parent Category"
          source="parentCategoryId"
          reference="category"
        >
          <AutocompleteInput optionText="name" />
        </ReferenceInput>
        <TextInput source="name" />
      </SimpleForm>
    </Create>
  );
};

export const CategoryEdit = (props: EditProps) => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput
        label="Parent Category"
        source="parentCategoryId"
        reference="category"
      >
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <TextInput source="name" />
    </SimpleForm>
  </Edit>
);

export const CategoryChild = (props: CreateProps) => {
  const record = useRecordContext();
  return (
    <ListBase {...props} filter={{ parentCategoryId: record.id }}>
      <Datagrid
        bulkActionButtons={false}
        expand={CategoryChild}
        sx={{
          border: "1px solid grey",
          marginLeft: 2,
        }}
        empty={<Typography variant="caption">No child categories</Typography>}
      >
        <TextField source="id" sortable={false} />
        <TextField source="name" sortable={false} />
        <DateField source="createdAt" sortable={false} />
        <DateField source="updatedAt" sortable={false} />
      </Datagrid>
    </ListBase>
  );
};

export const CategoryList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick={"edit"} expand={CategoryChild}>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="createdAt" />
      <DateField source="updatedAt" />
    </Datagrid>
  </List>
);
