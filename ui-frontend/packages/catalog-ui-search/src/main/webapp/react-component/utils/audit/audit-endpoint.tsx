import fetch from '../fetch'

export type AuditLog = {
  action: string
  component: string
  ids: Set<string> | string
}

export const postAuditLog = async ({ action, component, ids }: AuditLog) => {
  if (typeof ids === 'string') {
    const idSet = new Set<string>()
    idSet.add(ids)
    const body = {
      action: action,
      component: component,
      ids: idSet,
    }
    await fetch(`./internal/audit/`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  } else {
    const body = {
      action: action,
      component: component,
      ids: ids,
    }
    await fetch(`./internal/audit/`, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }
}
