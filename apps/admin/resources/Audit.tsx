import {
  Datagrid,
  DateField,
  List,
  ListProps,
  ReferenceField,
  TextField,
  TextInput,
} from "react-admin";
import { ExtendedJsonField } from "../fields/ExtendedJsonField";

export const AuditList = (props: ListProps) => (
  <List
    sort={{ field: "date", order: "DESC" }}
    filters={[
      <TextInput
        key="payload_pgjson.data.name"
        label="Payoad.data.name (exact by convention)"
        source="payload_pgjson.data.name"
        alwaysOn
      />,
    ]}
    {...props}
  >
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
