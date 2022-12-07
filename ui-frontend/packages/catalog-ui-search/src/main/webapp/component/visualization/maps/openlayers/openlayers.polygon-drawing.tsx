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
import ol from 'openlayers'
import _ from 'underscore'
import properties from '../../../../js/properties'
import wreqr from '../../../../js/wreqr'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module '@tur... Remove this comment to see the full error message
import Turf from '@turf/turf'
import { validateGeo } from '../../../../react-component/utils/validation'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { useRender } from '../../../hooks/useRender'
import OpenLayersGeometryUtils from '../../../../js/OpenLayersGeometryUtils'
import { useIsDrawing } from '../../../singletons/drawing'
type CoordinateType = [number, number]
type CoordinatesType = Array<CoordinateType>
function translateFromOpenlayersCoordinates(coords: CoordinatesType) {
  const coordinates = [] as CoordinatesType
  coords.forEach((point) => {
    point = ol.proj.transform(
      [
        DistanceUtils.coordinateRound(point[0]),
        DistanceUtils.coordinateRound(point[1]),
      ],
      (properties as any).projection,
      'EPSG:4326'
    )
    if (point[1] > 90) {
      point[1] = 89.9
    } else if (point[1] < -90) {
      point[1] = -89.9
    }
    coordinates.push(point)
  })
  return coordinates
}
function translateToOpenlayersCoordinates(coords: CoordinatesType) {
  const coordinates = [] as CoordinatesType
  coords.forEach((item) => {
    if (item[0].constructor === Array) {
      coordinates.push(
        (translateToOpenlayersCoordinates(
          (item as unknown) as CoordinatesType
        ) as unknown) as CoordinateType
      )
    } else {
      coordinates.push(
        ol.proj.transform(
          [item[0], item[1]],
          'EPSG:4326',
          (properties as any).projection
        )
      )
    }
  })
  return coordinates
}
const modelToPolygon = (model: any) => {
  const polygon = model.get('line')
  const setArr = _.uniq(polygon)
  if (setArr.length < 2) {
    return
  }
  const rectangle = new ol.geom.LineString(
    translateToOpenlayersCoordinates(setArr)
  )
  return rectangle
}
const adjustPoints = (coordinates: any) => {
  // Structure of coordinates is [x, y, x, y, ... ]
  coordinates.forEach((_coord: any, index: any) => {
    if (index + 2 < coordinates.length) {
      const east = Number(coordinates[index + 2])
      const west = Number(coordinates[index])
      if (east - west < -180) {
        coordinates[index + 2] = east + 360
      } else if (east - west > 180) {
        coordinates[index] = west + 360
      }
    }
  })
  return coordinates
}
const removeOldDrawing = ({ map, model }: { map: ol.Map; model: any }) => {
  const oldLayer = map
    .getLayers()
    .getArray()
    .find((layer) => {
      return layer.get('id') === model.cid
    })
  if (oldLayer) {
    map.removeLayer(oldLayer)
  }
}
const drawBorderedPolygon = ({
  map,
  model,
  rectangle,
}: {
  map: any
  model: any
  rectangle: any
}) => {
  if (!rectangle) {
    // Handles case where model changes to empty vars and we don't want to draw anymore
    return
  }
  const lineWidth =
    DistanceUtils.getDistanceInMeters(
      model.get('lineWidth'),
      model.get('lineUnits')
    ) || 1
  rectangle.A = adjustPoints(rectangle.A)
  const turfLine = Turf.lineString(
    translateFromOpenlayersCoordinates(rectangle.getCoordinates())
  )
  const bufferedLine = Turf.buffer(turfLine, lineWidth, 'meters')
  const geometryRepresentation = new ol.geom.MultiLineString(
    (translateToOpenlayersCoordinates(
      bufferedLine.geometry.coordinates
    ) as unknown) as any
  )
  const billboard = new ol.Feature({
    geometry: geometryRepresentation,
  })
  billboard.setId(model.cid)
  const color = model.get('color')
  const iconStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: color ? color : '#914500',
      width: 3,
    }),
  })
  billboard.setStyle(iconStyle)
  const vectorSource = new ol.source.Vector({
    features: [billboard],
  })
  let vectorLayer = new ol.layer.Vector({
    source: vectorSource,
  })
  vectorLayer.set('id', model.cid)
  var mapRef = map.getMap() as ol.Map
  removeOldDrawing({ map: mapRef, model })
  map.getMap().addLayer(vectorLayer)
}
const updatePrimitive = ({ map, model }: { map: any; model: any }) => {
  const polygon = modelToPolygon(model)
  // Make sure the current model has width and height before drawing
  if (
    polygon !== undefined &&
    !validateGeo('line', JSON.stringify(polygon.getCoordinates()))?.error
  ) {
    drawBorderedPolygon({ map, model, rectangle: polygon })
  }
}
const useListenToLineModel = ({ model, map }: { model: any; map: any }) => {
  const callback = React.useMemo(() => {
    return () => {
      updatePrimitive({ map, model })
    }
  }, [model, map])
  useListenTo(model, 'change:line change:lineWidth change:lineUnits', callback)
}
export const OpenlayersLineDrawingStatic = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useListenToLineModel({ map, model })
  return <></>
}
const setModelFromGeometry = ({
  model,
  geometry,
}: {
  model: any
  geometry: any
}) => {
  model.set({
    line: translateFromOpenlayersCoordinates(geometry.getCoordinates()),
  })
}
const useStartMapDrawing = ({ map, model }: { map: any; model: any }) => {
  const [feature, setFeature] = React.useState<any>(null)
  const render = useRender()
  React.useEffect(() => {
    if (feature && map && model) {
      let animationId = window.requestAnimationFrame(() => {
        drawBorderedPolygon({
          map,
          model,
          rectangle: feature.feature.getGeometry(),
        })
        render()
      })
      return () => {
        cancelAnimationFrame(animationId)
      }
    }
    return () => {}
  }, [feature, map, model, render])
  React.useEffect(() => {
    if (map && model) {
      const mapRef = map.getMap() as ol.Map
      const primitive = new ol.interaction.Draw({
        type: 'LineString',
        style: new ol.style.Style({
          stroke: new ol.style.Stroke({
            color: [0, 0, 255, 0],
          }),
        }),
      })
      mapRef.addInteraction(primitive)
      primitive.on('drawstart', (sketchFeature: any) => {
        setFeature(sketchFeature)
      })
      primitive.on('drawend', (sketchFeature: any) => {
        const geometry = OpenLayersGeometryUtils.wrapCoordinatesFromGeometry(
          sketchFeature.feature.getGeometry()
        )
        setModelFromGeometry({ geometry, model })
        model.trigger('EndExtent', model)
        ;(wreqr as any).vent.trigger('search:linedisplay', model)
        ;(wreqr as any).vent.trigger('search:drawline-end', model)
        mapRef.removeInteraction(primitive)
      })
    }
  }, [map, model])
}
export const OpenlayersLineDrawingDynamic = ({
  map,
  model,
}: {
  map: any
  model: any
}) => {
  useStartMapDrawing({ map, model })
  return <></>
}
export const OpenlayersLineDrawings = ({ map }: { map: any }) => {
  const [models, setModels] = React.useState<Array<any>>([])
  const [drawingModels, setDrawingModels] = React.useState<Array<any>>([])
  const isDrawing = useIsDrawing()
  useListenTo((wreqr as any).vent, 'search:linedisplay', (model: any) => {
    if (!models.includes(model)) {
      setModels([...models, model])
    }
  })
  useListenTo((wreqr as any).vent, 'search:drawline', (model: any) => {
    if (!drawingModels.includes(model)) {
      setDrawingModels([...drawingModels, model])
    }
  })
  useListenTo((wreqr as any).vent, 'search:drawline-end', (model: any) => {
    if (drawingModels.includes(model)) {
      setDrawingModels(
        drawingModels.filter((drawingModel) => drawingModel !== model)
      )
    }
  })
  React.useEffect(() => {
    if (!isDrawing) {
      setDrawingModels([])
    }
  }, [isDrawing])
  return (
    <>
      {models.map((model) => {
        return (
          <OpenlayersLineDrawingStatic key={model.id} model={model} map={map} />
        )
      })}
      {drawingModels.map((model) => {
        return (
          <OpenlayersLineDrawingDynamic
            key={model.id}
            model={model}
            map={map}
          />
        )
      })}
    </>
  )
}
