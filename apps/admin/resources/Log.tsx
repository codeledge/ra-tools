import {
  Datagrid,
  DateField,
  List,
  ListProps,
  SelectInput,
  TextField,
} from "react-admin";
import { ExtendedJsonField } from "../fields/ExtendedJsonField";

export const LogList = (props: ListProps) => (
  <List
    {...props}
    filters={[
      <SelectInput
        key="paymentType"
        source="payload.data.type"
        choices={[
          { id: "payment", name: "Payment" },
          { id: "request", name: "Request" },
          { id: "refund", name: "Refund" },
        ]}
        alwaysOn
      />,
    ]}
  >
    <Datagrid rowClick="show">
      <TextField source="id" />
      <ExtendedJsonField source="payload" />
      <DateField source="createdAt" />
      <TextField source="action" />
      <TextField source="resource" />
    </Datagrid>
  </List>
);
