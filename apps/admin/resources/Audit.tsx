import {
  Datagrid,
  DateField,
  List,
  ListProps,
  SelectInput,
  TextField,
} from "react-admin";
import { ExtendedJsonField } from "../fields/ExtendedJsonField";

export const AuditList = (props: ListProps) => (
  <List {...props}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <ExtendedJsonField source="payload" />
      <DateField source="date" />
      <TextField source="action" />
      <TextField source="resource" />
    </Datagrid>
  </List>
);
