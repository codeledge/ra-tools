import {
  Datagrid,
  DateField,
  List,
  ListProps,
  ReferenceField,
  TextField,
} from "react-admin";
import { ExtendedJsonField } from "../fields/ExtendedJsonField";

export const AuditList = (props: ListProps) => (
  <List sort={{ field: "date", order: "DESC" }} {...props}>
    <Datagrid rowClick="show">
      <ReferenceField label="Author" source="authorId" reference="adminUser">
        <TextField source="name" />
      </ReferenceField>
      <ExtendedJsonField source="payload" />
      <DateField source="date" showTime />
      <TextField source="action" />
      <TextField source="resource" />
    </Datagrid>
  </List>
);
