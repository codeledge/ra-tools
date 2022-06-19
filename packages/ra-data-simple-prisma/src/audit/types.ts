// model Log {
//   id       String    @id @default(cuid())
//   date     DateTime  @default(now())
//   resource String
//   action   String
//   payload  Json?
//   authorId String
//   author   AdminUser @relation(fields: [authorId], references: [id], onDelete: Cascade)
// }

export type AuditOptions = {
  tableName?: string; //defaults to "audit_logs"
  tableColumns?: {
    id?: string;
    date?: string;
    resource?: string;
    action?: string;
    payload?: string;
    author?: string;
  };
  enabledFor?: {
    create?: boolean;
    update?: boolean;
    delete?: boolean;
  };
  enabledResources?: string[];
};

export type AuditActions = "create" | "update" | "delete";
