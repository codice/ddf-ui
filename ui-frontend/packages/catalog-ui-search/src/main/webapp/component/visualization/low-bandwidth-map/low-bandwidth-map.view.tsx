/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import React from 'react'
import { CesiumMapViewReact } from '../maps/cesium/cesium.view'
import { OpenlayersMapViewReact } from '../maps/openlayers/openlayers.view'

export const LowBandwidthMapViewReact = ({
  selectionInterface,
  desiredContainer,
}: {
  selectionInterface: any
  desiredContainer: 'cesium' | string
}) => {
  const [continueLoading, setContinueLoading] = React.useState(false)

  if (!continueLoading) {
    return (
      <>
        <div className="low-bandwidth-confirmation">
          <h3 className="text-center">
            Low-bandwidth mode is enabled. Please confirm that you want this
            component to load despite potential bandwidth implications. Choosing
            to continue may cause available connection resources to be
            exhausted, and you or other users on your network may experience
            slowdowns or extended periods of waiting while necessary resources
            are fetched.
          </h3>
          <button
            className="old-button low-bandwidth-button is-positive"
            onClick={() => {
              setContinueLoading(true)
            }}
          >
            <span>Continue to Map</span>
          </button>
        </div>
      </>
    )
  }
  if (desiredContainer === 'cesium') {
    return <CesiumMapViewReact selectionInterface={selectionInterface} />
  }
  return <OpenlayersMapViewReact selectionInterface={selectionInterface} />
}
