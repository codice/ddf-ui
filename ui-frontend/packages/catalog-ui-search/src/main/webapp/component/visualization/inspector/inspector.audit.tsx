import React from 'react'
import { useEffect } from 'react'
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks'
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks'
import {
  AuditItem,
  postAuditLog,
} from '../../../react-component/utils/audit/audit-endpoint'

export const useSelectionAuditing = ({
  selectionInterface,
}: {
  selectionInterface: any
}) => {
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResults = useSelectedResults({
    lazyResults,
  })
  const [selectedIds, setSelectedIds] = React.useState(new Set<string>())
  const getAuditItems = (ids: Set<string>) => {
    let items: AuditItem[] = []

    ids.forEach((id) => {
      const properties = lazyResults?.results[id]?.plain?.metacard?.properties

      if (properties) {
        items.push({ id: properties.id, 'source-id': properties['source-id'] })
      }
    })

    return items
  }

  useEffect(() => {
    let newSelectedIds = new Set(Object.keys(selectedResults))
    let unselectedIds = new Set<string>()

    selectedIds.forEach((id: string) => {
      if (!newSelectedIds.has(id)) {
        unselectedIds.add(id)
      }
    })

    let newSelectedItems = getAuditItems(newSelectedIds)
    let unselectedItems = getAuditItems(unselectedIds)

    if (unselectedItems.length > 0) {
      postAuditLog({
        action: 'unselected',
        component: 'resource',
        items: unselectedItems,
      })
    }

    if (newSelectedItems.length > 0) {
      postAuditLog({
        action: 'selected',
        component: 'resource',
        items: newSelectedItems,
      })
      setSelectedIds(newSelectedIds)
    }
  }, [selectedResults])
}

export const AuditComponent = ({
  selectionInterface,
}: {
  selectionInterface: any
}) => {
  useSelectionAuditing({ selectionInterface })
  return null
}
