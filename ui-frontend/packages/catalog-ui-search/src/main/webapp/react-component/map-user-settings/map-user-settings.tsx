import * as React from 'react'
import CoordinateSettings from './coordinate-settings'
import MapLayerSettings from '../../component/layers/layers.view'

export const MapUserSettings = () => {
  return (
    <>
      <CoordinateSettings />
      <MapLayerSettings />
    </>
  )
}
