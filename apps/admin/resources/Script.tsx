import {
  Button,
  Datagrid,
  List,
  ListProps,
  WrapperField,
  TextField,
  FunctionField,
} from "react-admin";
import axios from "axios";

export const ScriptList = (props: ListProps) => {
  return (
    <List {...props}>
      <Datagrid rowClick={"show"}>
        <TextField source="id" />
        <WrapperField label="Actions">
          <FunctionField
            render={(record: any) => <StartButton record={record} />}
          />
          <Button variant="contained" label="Stop" />
        </WrapperField>
      </Datagrid>
    </List>
  );
};

const StartButton = ({ record }: any) => {
  const runScript = async () => {
    await axios.post(`/api/script`, {
      method: "start",
      id: record.id,
    });
  };

  return (
    <Button
      onClick={runScript}
      variant="outlined"
      label="Start"
      sx={{ marginRight: 2 }}
    />
  );
};
