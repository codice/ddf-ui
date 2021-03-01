import * as React from 'react'
import MarionetteRegionContainer from '../marionette-region-container'
import CoordinateSettings from './coordinate-settings'
const MapLayerSettings = require('../../component/layers/layers.view.js')

export const MapUserSettings = () => {
  return (
    <>
      <CoordinateSettings />
      <MarionetteRegionContainer view={MapLayerSettings} />
    </>
  )
}
