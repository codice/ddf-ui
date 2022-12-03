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
import DistanceUtils from '../../../../js/DistanceUtils'
import Cesium from 'cesium'
import wreqr from '../../../../js/wreqr.js'

const enableInput = ({ map }: { map: any }) => {
  const controller = map.getMap().scene.screenSpaceCameraController
  controller.enableTranslate = true
  controller.enableZoom = true
  controller.enableRotate = true
  controller.enableTilt = true
  controller.enableLook = true
}

const disableInput = ({ map }: { map: any }) => {
  const controller = map.getMap().scene.screenSpaceCameraController
  controller.enableTranslate = false
  controller.enableZoom = false
  controller.enableRotate = false
  controller.enableTilt = false
  controller.enableLook = false
}

const setCircleRadius = ({
  model,
  map,
  mn,
  mx,
}: {
  model: any
  mn: any
  mx: any
  map: any
}) => {
  const startCartographic = map
    .getMap()
    .scene.globe.ellipsoid.cartographicToCartesian(mn)
  const stopCart = map
    .getMap()
    .scene.globe.ellipsoid.cartographicToCartesian(mx)
  const radius = Math.abs(
    Cesium.Cartesian3.distance(startCartographic, stopCart)
  )

  const modelProp = {
    lat: DistanceUtils.coordinateRound((mn.latitude * 180) / Math.PI),
    lon: DistanceUtils.coordinateRound((mn.longitude * 180) / Math.PI),
    radius: DistanceUtils.coordinateRound(
      DistanceUtils.getDistanceFromMeters(radius, model.get('radiusUnits'))
    ),
  }

  model.set(modelProp)
}

const useStartMapDrawing = ({ map, model }: { map: any; model: any }) => {
  React.useEffect(() => {
    if (map && model) {
      const mouseHandler = new Cesium.ScreenSpaceEventHandler(
        map.getMap().scene.canvas
      )
      disableInput({ map })
      mouseHandler.setInputAction((movement: any) => {
        const cartesian = map
          .getMap()
          .scene.camera.pickEllipsoid(
            movement.position,
            map.getMap().scene.globe.ellipsoid
          )
        if (cartesian) {
          const click1 = map
            .getMap()
            .scene.globe.ellipsoid.cartesianToCartographic(cartesian)
          mouseHandler.setInputAction(() => {
            enableInput({ map })
            if (!mouseHandler.isDestroyed()) {
              mouseHandler.destroy()
            }
            model.trigger('EndExtent', model)
            wreqr.vent.trigger('search:circledisplay', model)
          }, Cesium.ScreenSpaceEventType.LEFT_UP)
          mouseHandler.setInputAction((movement: any) => {
            let cartesian = map
                .getMap()
                .scene.camera.pickEllipsoid(
                  movement.endPosition,
                  map.getMap().scene.globe.ellipsoid
                ),
              cartographic
            if (cartesian) {
              cartographic = map
                .getMap()
                .scene.globe.ellipsoid.cartesianToCartographic(cartesian)
              setCircleRadius({ mn: click1, mx: cartographic, model, map })
            }
          }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN)
      return () => {
        mouseHandler.destroy()
        enableInput({ map })
      }
    }
    return () => {}
  }, [map, model])
}

export const CesiumCircleDrawing = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useStartMapDrawing({ map, model })
  React.useEffect(() => {
    return () => {
      if (map && model) {
        map.getMap().drawHelper.stopDrawing()
      }
    }
  }, [map, model])
  return <></>
}
