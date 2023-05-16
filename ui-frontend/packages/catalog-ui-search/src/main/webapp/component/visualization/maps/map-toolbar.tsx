import Button from '@mui/material/Button'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import MapSettings from '../../../react-component/map-settings'
import ZoomToHomeButton from '../../../react-component/button/split-button/zoomToHome'
import Gazetteer from '../../../react-component/location/gazetteer'
import { LayersDropdown } from '../../layers/layers-dropdown'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import Paper from '@mui/material/Paper'
import { Elevations } from '../../theme/theme'

type Props = {
  toggleClustering: () => void
  isClustering: boolean
  zoomToHome: () => void
  saveAsHome: () => void
  map: {
    doPanZoom: (polygon: any) => void
  }
}

const ClusteringButton = ({ toggleClustering, isClustering }: Props) => {
  return (
    <Button
      data-id="cluster-button"
      onClick={() => {
        toggleClustering()
      }}
      size="small"
      color="primary"
    >
      <div className="flex flex-row items-center">
        {isClustering ? (
          <CheckBoxIcon className="Mui-text-text-primary" />
        ) : (
          <CheckBoxOutlineBlankIcon className="Mui-text-text-primary" />
        )}
        <span className="pr-2">Cluster</span>
      </div>
    </Button>
  )
}

export const MapToolbar = (props: Props) => {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <Paper
      className="absolute z-10 right-0 m-4 max-w-full-4 truncate"
      elevation={Elevations.overlays}
    >
      <div className="flex flex-row items-center overflow-auto w-full flex-nowrap px-2">
        <div className="py-2">
          {expanded ? (
            <Button
              size="small"
              color="primary"
              onClick={() => {
                setExpanded(false)
              }}
              className="shrink-0"
            >
              <KeyboardArrowRightIcon
                color="inherit"
                className="Mui-text-text-primary Mui-icon-size-small"
              />
              <KeyboardArrowRightIcon
                color="inherit"
                className="-ml-3 Mui-text-text-primary Mui-icon-size-small"
              />
            </Button>
          ) : (
            <Button
              size="small"
              color="primary"
              onClick={() => {
                setExpanded(true)
              }}
              data-id="expand-map-tools-button"
            >
              <KeyboardArrowLeftIcon
                color="inherit"
                className="Mui-text-text-primary Mui-icon-size-small"
              />
              <KeyboardArrowLeftIcon
                color="inherit"
                className="-ml-3 Mui-text-text-primary Mui-icon-size-small"
              />
              Map Tools
            </Button>
          )}
        </div>
        {expanded ? (
          <>
            <div className="w-64 min-w-32 py-2 shrink-1 truncate">
              <Gazetteer
                variant="outlined"
                placeholder="Go to a location"
                setState={({ polygon }: any) => props.map.doPanZoom(polygon)}
              />
            </div>
            <div className="py-2 pr-2 shrink-0">
              <ClusteringButton {...props} />
            </div>
            <div className="Mui-bg-default w-min self-stretch shrink-0"></div>
            <div className="py-2 px-2 shrink-0">
              <LayersDropdown />
            </div>
            <div className="Mui-bg-default w-min self-stretch shrink-0"></div>
            <div className="py-2 px-2 shrink-0">
              <ZoomToHomeButton
                goHome={() => props.zoomToHome()}
                saveHome={() => props.saveAsHome()}
              />
            </div>
            <div className="Mui-bg-default w-min self-stretch shrink-0"></div>
            <div className="py-2 pl-2 shrink-0">
              <MapSettings />
            </div>
          </>
        ) : null}
      </div>
    </Paper>
  )
}

export default hot(module)(MapToolbar)
