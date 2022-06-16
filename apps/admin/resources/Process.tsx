import {
  Button,
  Datagrid,
  List,
  ListProps,
  WrapperField,
  TextField,
  FunctionField,
  AutocompleteInput,
  Create,
  CreateProps,
  ReferenceInput,
  SimpleForm,
  TextInput,
  DeleteButton,
} from "react-admin";
import axios from "axios";

export const ProcessList = (props: ListProps) => {
  return (
    <List {...props}>
      <Datagrid>
        <TextField source="id" />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export const ProcessCreate = (props: CreateProps) => (
  <Create title="New post" {...props}>
    <SimpleForm>
      <ReferenceInput label="Script" source="scriptId" reference="script">
        <AutocompleteInput optionText="id" />
      </ReferenceInput>
      <TextInput source="id" />
    </SimpleForm>
  </Create>
);

// const StartButton = ({ record }: any) => {
//   const runScript = async () => {
//     await axios.post(`/api/script`, {
//       method: "start",
//       id: record.id,
//     });
//   };

//   return (
//     <Button
//       onClick={runScript}
//       variant="outlined"
//       label="Start"
//       sx={{ marginRight: 2 }}
//     />
//   );
// };

const StopButton = ({ record }: any) => {
  const stopScript = async () => {
    await axios.post(`/api/scriptRuntime`, {
      method: "stop",
      id: record.id,
    });
  };

  return (
    <Button
      onClick={stopScript}
      variant="outlined"
      label="Stop"
      sx={{ marginRight: 2 }}
    />
  );
};
