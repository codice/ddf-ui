import fetch from '../fetch'

export type AuditItem = {
  id: String
  'source-id'?: String
}

export type AuditLog = {
  action: string
  component: string
  items: AuditItem[]
}

export const postAuditLog = async ({ action, component, items }: AuditLog) => {
  const body = {
    action,
    component,
    items,
  }
  await fetch(`./internal/audit/`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
