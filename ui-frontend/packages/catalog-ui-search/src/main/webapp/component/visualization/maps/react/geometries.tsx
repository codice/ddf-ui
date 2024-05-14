import * as React from 'react'
import { hot } from 'react-hot-loader'
import { Drawing } from '../../../singletons/drawing'
import { useLazyResultsFromSelectionInterface } from '../../../selection-interface/hooks'
import Geometry from './geometry'
import CalculateClusters from './calculate-clusters'
import Cluster from './cluster'
import { LazyQueryResult } from '../../../../js/model/LazyQueryResult/LazyQueryResult'
import ZoomToSelection from './zoom-to-selection'
import { SHAPE_ID_PREFIX } from '../drawing-and-display'
type Props = {
  selectionInterface: any
  map: any
  isClustering: boolean
}

export type ClusterType = {
  results: LazyQueryResult[]
  id: string
}

const Geometries = (props: Props) => {
  const { map, selectionInterface, isClustering } = props
  const lazyResults = useLazyResultsFromSelectionInterface({
    selectionInterface,
  })
  const lazyResultsRef = React.useRef(lazyResults)
  lazyResultsRef.current = lazyResults
  const [clusters, setClusters] = React.useState([] as ClusterType[])
  // possible since we debounce
  if (isClustering === false && clusters.length > 0) {
    setClusters([])
  }
  React.useEffect(() => {
    const handleCtrlClick = (id: string | string[]) => {
      if (id.constructor === String) {
        lazyResultsRef.current.results[id as string].controlSelect()
      } else {
        ;(id as string[]).map((subid) => {
          return lazyResultsRef.current.results[subid as string].controlSelect()
        })
      }
    }
    const handleClick = (id: string | string[]) => {
      if (id.constructor === String) {
        lazyResultsRef.current.results[id as string].select()
      } else {
        const resultIds = id as string[]
        let shouldJustDeselect = resultIds.some(
          (subid) => lazyResultsRef.current.results[subid].isSelected
        )
        lazyResultsRef.current.deselect()
        if (!shouldJustDeselect) {
          resultIds.map((subid) => {
            return lazyResultsRef.current.results[
              subid as string
            ].controlSelect()
          })
        }
      }
    }
    const handleLeftClick = (event: any, mapEvent: any) => {
      if (
        mapEvent.mapTarget &&
        mapEvent.mapTarget !== 'userDrawing' &&
        !Drawing.isDrawing()
      ) {
        // we get click events on normal drawn features from the location drawing
        if (
          mapEvent.mapTarget.constructor === String &&
          (mapEvent.mapTarget as string).startsWith(SHAPE_ID_PREFIX)
        ) {
          return
        }
        if (event.shiftKey) {
          handleCtrlClick(mapEvent.mapTarget)
        } else if (event.ctrlKey || event.metaKey) {
          handleCtrlClick(mapEvent.mapTarget)
        } else {
          handleClick(mapEvent.mapTarget)
        }
      }
    }
    map.onLeftClick(handleLeftClick)
    return () => {}
  }, [])

  const IndividualGeometries = React.useMemo(() => {
    return Object.values(lazyResults.results).map((lazyResult) => {
      return (
        <Geometry
          key={lazyResult['metacard.id']}
          lazyResult={lazyResult}
          map={map}
          clusters={clusters}
        />
      )
    })
  }, [lazyResults.results, clusters])

  const Clusters = React.useMemo(() => {
    return clusters.map((cluster) => {
      return <Cluster key={cluster.id} cluster={cluster} map={map} />
    })
  }, [clusters, lazyResults.results])

  const CalculateClustersMemo = React.useMemo(() => {
    return (
      <CalculateClusters
        key="clusters"
        isClustering={isClustering}
        map={map}
        lazyResults={lazyResults.results}
        setClusters={setClusters}
      />
    )
  }, [lazyResults.results, isClustering])

  const ZoomToSelectionMemo = React.useMemo(() => {
    return <ZoomToSelection map={map} lazyResults={lazyResults} />
  }, [lazyResults])

  return (
    <>
      {ZoomToSelectionMemo}
      {CalculateClustersMemo}
      {Clusters}
      {IndividualGeometries}
    </>
  )
}

export default hot(module)(Geometries)
