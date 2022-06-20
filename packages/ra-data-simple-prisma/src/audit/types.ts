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
  model?: { create: Function };
  authProvider: any;
  columns?: {
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

export const defaultAuditOptions: AuditOptions = {
  authProvider: null,
  columns: {
    id: "id",
    date: "date",
    resource: "resource",
    action: "action",
    payload: "payload",
    author: "author",
  },
  enabledFor: {
    create: true,
    update: true,
    delete: true,
  },
};

export type AuditActions = "create" | "update" | "delete";
