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

export type SimpleAuditLog = {
  action: string
  component: string
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

export const postSimpleAuditLog = async ({
  action,
  component,
}: SimpleAuditLog) => {
  const body = {
    action,
    component,
  }
  await fetch(`./internal/audit/simple`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
