import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useSelectedResults } from '../../../../js/model/LazyQueryResult/hooks'
import { LazyQueryResults } from '../../../../js/model/LazyQueryResult/LazyQueryResults'

type Props = {
  lazyResults: LazyQueryResults
  map: any
  zoomToHome: (props: { map: any }) => void
}

const ZoomToSelection = ({ lazyResults, map, zoomToHome }: Props) => {
  const selectedResults = useSelectedResults({ lazyResults })

  React.useEffect(() => {
    const arrayForm = Object.values(selectedResults)
    if (arrayForm.length > 0) {
      setTimeout(() => {
        map.panToResults(Object.values(selectedResults))
      }, 0)
    }
  }, [selectedResults])
  React.useEffect(() => {
    const arrayForm = Object.values(selectedResults)

    if (arrayForm.length === 0) {
      setTimeout(() => {
        zoomToHome({ map })
      }, 0)
    }
  }, [])
  return null
}

export default hot(module)(ZoomToSelection)
