export type AuditLog = {
  action: string
  component: string
  ids: Set<string> | string
}
