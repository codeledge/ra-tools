export interface Permission<T> {
  /**
   * @default 'allow'
   */
  type?: "allow" | "deny";
  /**
   * List of actions to allow/deny for the resource
   * Can be a single action or an array of actions
   */
  action: Action | Action[];
  /**
   * Resource to allow/deny the actions on
   * This is ideally typed but is also of type string for joint resources ex. user.email
   */
  resource: T | "*" | string;
  record?: any;
}

export type Action =
  | "*"
  // later for more granular permissions
  // | "read"
  // | "write"
  | "list"
  | "show"
  | "create"
  | "edit"
  | "delete"
  | "export";

export type Permissions<T> = Permission<T>[];
