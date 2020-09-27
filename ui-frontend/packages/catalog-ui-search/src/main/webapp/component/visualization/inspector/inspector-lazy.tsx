import React from 'react'
import { useEffect } from 'react'
import { hot } from 'react-hot-loader'
import { useLazyResultsFromSelectionInterface } from '../../selection-interface/hooks'
import MRC from '../../../react-component/marionette-region-container'
import { useSelectedResults } from '../../../js/model/LazyQueryResult/hooks'
import { postAuditLog } from '../../../react-component/utils/audit/audit-endpoint'
const InspectorView = require('./inspector.view')

let selectedIds = new Set<string>()

type Props = {
  selectionInterface: any
}

const LazyInspector = ({ selectionInterface }: Props) => {
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const selectedResults = useSelectedResults({
    lazyResults,
  })
  const backboneModels = Object.values(selectedResults).map((result) => {
    return result.getBackbone()
  })
  React.useEffect(() => {
    selectionInterface.setSelectedResults(backboneModels)
  })

  useEffect(() => {
    let newSelectedIds = new Set(Object.keys(selectedResults))

    let unselectedIds = new Set<string>()
    if (selectedIds.size > 0) {
      selectedIds.forEach((id: string) => {
        if (!newSelectedIds.has(id)) {
          unselectedIds.add(id)
        }
      })
      if (unselectedIds.size > 0) {
        postAuditLog({
          action: 'unselected',
          component: 'resource',
          ids: unselectedIds,
        })
      }
    }

    if (newSelectedIds.size > 0) {
      postAuditLog({
        action: 'selected',
        component: 'resource',
        ids: newSelectedIds,
      })
      selectedIds = newSelectedIds
    }
  }, [selectedResults])

  return (
    <MRC
      key="inspector"
      view={InspectorView}
      viewOptions={{
        selectionInterface,
      }}
    />
  )
}

export default hot(module)(LazyInspector)
