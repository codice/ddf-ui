import * as React from 'react'
import MarionetteRegionContainer from '../marionette-region-container'
import CoordinateSettings from './coordinate-settings'
import MapLayerSettings from '../../component/layers/layers.view'

export const MapUserSettings = () => {
  return (
    <>
      <CoordinateSettings />
      <MarionetteRegionContainer view={MapLayerSettings} />
    </>
  )
}
