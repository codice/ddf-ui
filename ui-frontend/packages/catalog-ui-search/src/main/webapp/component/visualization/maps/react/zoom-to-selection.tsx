import * as React from 'react'

import { useSelectedResults } from '../../../../js/model/LazyQueryResult/hooks'
import { LazyQueryResults } from '../../../../js/model/LazyQueryResult/LazyQueryResults'

type Props = {
  lazyResults: LazyQueryResults
  map: any
}

const ZoomToSelection = ({ lazyResults, map }: Props) => {
  const selectedResults = useSelectedResults({ lazyResults })

  React.useEffect(() => {
    const arrayForm = Object.values(selectedResults)
    if (arrayForm.length > 0) {
      setTimeout(() => {
        map.panToResults(Object.values(selectedResults))
      }, 0)
    }
  }, [selectedResults])
  return null
}

export default ZoomToSelection
