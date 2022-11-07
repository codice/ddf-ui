import * as React from 'react'
import MarionetteRegionContainer from '../marionette-region-container'
import CoordinateSettings from './coordinate-settings'
import MapLayerSettings from '../../component/layers/layers.view'
import LowBandwidthMapView from '../../component/visualization/low-bandwidth-map/low-bandwidth-map.view'
const SelectionInterface = require('../../component/selection-interface/selection-interface.model.js')

export const MapUserSettings = () => {
  return (
    <>
      <CoordinateSettings />
      <MapLayerSettings />
      <MarionetteRegionContainer
        view={LowBandwidthMapView}
        viewOptions={{
          selectionInterface: new SelectionInterface({}),
        }}
        style={{
          width: '400px',
          height: '200px',
        }}
        defaultStyling={false}
      />
    </>
  )
}
