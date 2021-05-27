import Button from '@material-ui/core/Button'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import MRC from '../../../react-component/marionette-region-container/marionette-region-container'
import MapSettings from '../../../react-component/map-settings'
import ZoomToHomeButton from '../../../react-component/button/split-button/zoomToHome'
import Gazetteer from '../../../react-component/location/gazetteer'
import LayersDropdown from '../../dropdown/layers/dropdown.layers.view'
import BubbleChartIcon from '@material-ui/icons/BubbleChart'
import { useTheme } from '@material-ui/core/styles'
const DropdownModel = require('../../dropdown/dropdown.js')
type Props = {
  mapView: {
    toggleClustering: () => void
    zoomToHome: () => void
    saveAsHome: () => void
    map: {
      doPanZoom: (polygon: any) => void
    }
  }
}

const ClusteringButton = ({ mapView }: Props) => {
  const theme = useTheme()
  const [isClustering, setIsClustering] = React.useState(false)
  return (
    <Button
      data-id="cluster-button"
      onClick={() => {
        mapView.toggleClustering()
        setIsClustering(!isClustering)
      }}
      size="small"
      style={{
        borderBottom: isClustering
          ? `1px solid ${theme.palette.warning.main}`
          : '0px',
      }}
    >
      <div className="flex flex-row items-center">
        <span className="pr-2">Cluster</span>
        <BubbleChartIcon />
      </div>
    </Button>
  )
}

export const MapToolbar = ({ mapView }: Props) => {
  return (
    <div className="map-toolbar">
      <div className="max-w-md">
        <Gazetteer
          variant="outlined"
          placeholder="Go to a location"
          setState={({ polygon }: any) => mapView.map.doPanZoom(polygon)}
        />
      </div>
      <div className="flex flex-row pt-2">
        <div className="pr-2">
          <ZoomToHomeButton
            goHome={() => mapView.zoomToHome()}
            saveHome={() => mapView.saveAsHome()}
          />
        </div>
        <div className="pr-2">
          <ClusteringButton mapView={mapView} />
        </div>
        <div className="pr-2">
          <MRC
            view={
              new LayersDropdown({
                model: new DropdownModel(),
              })
            }
          />
        </div>
        <div className="">
          <MapSettings />
        </div>
      </div>
    </div>
  )
}

export default hot(module)(MapToolbar)
