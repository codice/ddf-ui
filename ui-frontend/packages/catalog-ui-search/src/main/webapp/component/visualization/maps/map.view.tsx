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
import * as React from 'react'
import wreqr from '../../../js/wreqr'
import user from '../../singletons/user-instance'
import MapModel from './map.model'
import MapInfo from '../../../react-component/map-info'
import DistanceInfo from '../../../react-component/distance-info'
import getDistance from 'geolib/es/getDistance'
import { Drawing } from '../../singletons/drawing'
import MapToolbar from './map-toolbar'
import MapContextDropdown from '../../map-context-menu/map-context-menu.view'
import { useListenTo } from '../../selection-checkbox/useBackbone.hook'
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult'
import Geometries from './react/geometries'
import LinearProgress from '@mui/material/LinearProgress'
import PopupPreview from '../../../react-component/popup-preview'
import { SHAPE_ID_PREFIX, getDrawModeFromModel } from './drawing-and-display'
import useSnack from '../../hooks/useSnack'
import { zoomToHome } from './home'
import featureDetection from '../../singletons/feature-detection'
import Paper from '@mui/material/Paper'
import { Elevations } from '../../theme/theme'
import Button from '@mui/material/Button'
import PlusIcon from '@mui/icons-material/Add'
import MinusIcon from '@mui/icons-material/Remove'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium'
import { InteractionsContext, Translation } from './interactions.provider'
import Backbone from 'backbone'
import _ from 'lodash'
import ShapeUtils from '../../../js/ShapeUtils'

type HoverGeo = {
  interactive?: boolean
  id?: number
}

const useMapCode = (props: MapViewReactType) => {
  const [mapCode, setMapCode] = React.useState<any>(null)
  React.useEffect(() => {
    props.loadMap().then((Map: any) => {
      setMapCode({ createMap: Map })
    })
  }, [props.loadMap])
  return mapCode
}
const useMap = (
  props: MapViewReactType & {
    mapElement: HTMLDivElement | null
    mapModel: any
    containerElement: HTMLDivElement | null
    mapDrawingPopupElement: HTMLDivElement | null
  }
) => {
  const [map, setMap] = React.useState<any>(null)
  const mapCode = useMapCode(props)
  React.useEffect(() => {
    if (props.mapElement && mapCode) {
      try {
        setMap(
          mapCode.createMap(
            props.mapElement,
            props.selectionInterface,
            props.mapDrawingPopupElement,
            props.containerElement,
            props.mapModel
          )
        )
      } catch (err) {
        featureDetection.addFailure('cesium')
      }
    }
    return () => {
      if (props.mapElement && mapCode && map) {
        map.destroy()
      }
    }
  }, [props.mapElement, mapCode])
  return map
}
const useMapModel = () => {
  const [mapModel] = React.useState<any>(new MapModel())
  return mapModel
}
/*
    Handles drawing or clearing the ruler as needed by the measurement state.

    START indicates that a starting point should be drawn,
    so the map clears any previous points drawn and draws a new start point.

    END indicates that an ending point should be drawn,
    so the map draws an end point and a line, and calculates the distance.

    NONE indicates that the ruler should be cleared.
  */
const handleMeasurementStateChange = ({
  map,
  mapModel,
}: {
  map: any
  mapModel: any
}) => {
  const state = mapModel.get('measurementState')
  let point = null
  switch (state) {
    case 'START':
      clearRuler({ map, mapModel })
      point = map.addRulerPoint(mapModel.get('coordinateValues'))
      mapModel.addPoint(point)
      mapModel.setStartingCoordinates({
        lat: mapModel.get('coordinateValues')['lat'],
        lon: mapModel.get('coordinateValues')['lon'],
      })
      const polyline = map.addRulerLine(mapModel.get('coordinateValues'))
      mapModel.setLine(polyline)
      break
    case 'END':
      point = map.addRulerPoint(mapModel.get('coordinateValues'))
      mapModel.addPoint(point)
      map.setRulerLine({
        lat: mapModel.get('coordinateValues')['lat'],
        lon: mapModel.get('coordinateValues')['lon'],
      })
      break
    case 'NONE':
      clearRuler({ map, mapModel })
      break
    default:
      break
  }
}
/*
    Handles tasks for clearing the ruler, which include removing all points
    (endpoints of the line) and the line.
  */
const clearRuler = ({ map, mapModel }: { map: any; mapModel: any }) => {
  const points = mapModel.get('points')
  points.forEach((point: any) => {
    map.removeRulerPoint(point)
  })
  mapModel.clearPoints()
  const line = mapModel.removeLine()
  map.removeRulerLine(line)
}
/*
 *  Redraw and recalculate the ruler line and distanceInfo tooltip. Will not redraw while the menu is currently
 *  displayed updateOnMenu allows updating while the menu is up
 */
const updateDistance = ({
  map,
  mapModel,
  updateOnMenu = false,
}: {
  map: any
  mapModel: any
  updateOnMenu?: boolean
}) => {
  if (mapModel.get('measurementState') === 'START') {
    const openMenu = true // TODO: investigate this
    const lat = mapModel.get('mouseLat')
    const lon = mapModel.get('mouseLon')
    if ((updateOnMenu === true || !openMenu) && lat && lon) {
      // redraw ruler line
      const mousePoint = { lat, lon }
      map.setRulerLine(mousePoint)
      // update distance info
      const startingCoordinates = mapModel.get('startingCoordinates')
      const dist = getDistance(
        { latitude: lat, longitude: lon },
        {
          latitude: startingCoordinates['lat'],
          longitude: startingCoordinates['lon'],
        }
      )
      mapModel.setDistanceInfoPosition(
        (event as any).clientX,
        (event as any).clientY
      )
      mapModel.setCurrentDistance(dist)
    }
  }
}
const useWreqrMapListeners = ({ map }: { map: any }) => {
  useListenTo(map ? (wreqr as any).vent : undefined, 'metacard:overlay', () => {
    map.overlayImage.bind(map)()
  })
  useListenTo(
    map ? (wreqr as any).vent : undefined,
    'metacard:overlay:remove',
    () => {
      map.removeOverlay.bind(map)()
    }
  )
  useListenTo(
    map ? (wreqr as any).vent : undefined,
    'search:maprectanglefly',
    () => {
      map.zoomToExtent.bind(map)()
    }
  )
  React.useEffect(() => {
    if (map) {
    }
  }, [map])
}
const useSelectionInterfaceMapListeners = ({
  map,
  selectionInterface,
}: {
  map: any
  selectionInterface: any
}) => {
  useListenTo(
    map ? selectionInterface : undefined,
    'reset:activeSearchResults',
    () => {
      map.removeAllOverlays.bind(map)()
    }
  )
}
const useListenToMapModel = ({
  map,
  mapModel,
}: {
  map: any
  mapModel: any
}) => {
  useListenTo(
    map && mapModel ? mapModel : undefined,
    'change:measurementState',
    () => {
      handleMeasurementStateChange({ map, mapModel })
    }
  )
  useListenTo(
    map && mapModel ? mapModel : undefined,
    'change:mouseLat change:mouseLon',
    () => {
      updateDistance({ map, mapModel })
    }
  )
}
const updateTarget = ({
  mapModel,
  metacard,
}: {
  mapModel: any
  metacard: LazyQueryResult
}) => {
  let target
  let targetMetacard
  if (metacard) {
    target = metacard.plain.metacard.properties.title
    targetMetacard = metacard
  }
  mapModel.set({
    target,
    targetMetacard,
  })
}
const handleMapHover = ({
  mapModel,
  selectionInterface,
  mapEvent,
  setIsHoveringResult,
  setHoverGeo,
}: {
  map: any
  mapModel: any
  selectionInterface: any
  mapEvent: any
  setIsHoveringResult: (val: boolean) => void
  setHoverGeo: (val: HoverGeo) => void
}) => {
  const isHoveringOverGeo = Boolean(
    mapEvent.mapTarget &&
      mapEvent.mapTarget.constructor === String &&
      ((mapEvent.mapTarget as string).startsWith(SHAPE_ID_PREFIX) ||
        mapEvent.mapTarget === 'userDrawing')
  )

  if (isHoveringOverGeo) {
    setHoverGeo({
      id: mapEvent.mapLocationId,
      interactive: Boolean(mapEvent.mapLocationId),
    })
  } else {
    setHoverGeo({})
  }

  if (!selectionInterface) {
    return
  }
  const currentQuery = selectionInterface.get('currentQuery')
  if (!currentQuery) {
    return
  }
  const result = currentQuery.get('result')
  if (!result) {
    return
  }
  const metacard = result.get('lazyResults').results[mapEvent.mapTarget]
  updateTarget({ metacard, mapModel })

  setIsHoveringResult(
    Boolean(
      mapEvent.mapTarget &&
        mapEvent.mapTarget !== 'userDrawing' &&
        (mapEvent.mapTarget.constructor === Array ||
          (mapEvent.mapTarget.constructor === String &&
            !(mapEvent.mapTarget as string).startsWith(SHAPE_ID_PREFIX)))
    )
  )
}

const getLocation = (model: Backbone.Model, translation?: Translation) => {
  const locationType = getDrawModeFromModel({ model })
  switch (locationType) {
    case 'bbox':
      const bbox = _.pick(
        model.attributes,
        'mapNorth',
        'mapSouth',
        'mapEast',
        'mapWest'
      )
      if (translation) {
        bbox.mapNorth += translation.latitude
        bbox.mapSouth += translation.latitude
        bbox.mapEast += translation.longitude
        bbox.mapWest += translation.longitude
      }
      return bbox
    case 'circle':
      const point = _.pick(model.attributes, 'lat', 'lon')
      if (translation) {
        point.lat += translation.latitude
        point.lon += translation.longitude
      }
      return point
    case 'line':
      const line = JSON.parse(JSON.stringify(model.get('line')))
      if (translation) {
        for (const coord of line) {
          coord[0] += translation.longitude
          coord[1] += translation.latitude
        }
      }
      return { line }
    case 'poly':
      const polygon = JSON.parse(JSON.stringify(model.get('polygon')))
      if (translation) {
        const multiPolygon = ShapeUtils.isArray3D(polygon) ? polygon : [polygon]
        for (const ring of multiPolygon) {
          for (const coord of ring) {
            coord[0] += translation.longitude
            coord[1] += translation.latitude
          }
        }
      }
      return { polygon }
    default:
      return {}
  }
}

const useMapListeners = ({
  map,
  mapModel,
  selectionInterface,
}: {
  map: any
  mapModel: any
  selectionInterface: any
}) => {
  const [isHoveringResult, setIsHoveringResult] = React.useState(false)
  const [hoverGeo, setHoverGeo] = React.useState<HoverGeo>({})
  const {
    moveFrom,
    setMoveFrom,
    interactiveGeo,
    setInteractiveGeo,
    interactiveModels,
    setInteractiveModels,
    translation,
    setTranslation,
  } = React.useContext(InteractionsContext)

  const addSnack = useSnack()

  const upCallbackRef = React.useRef<() => void>()

  React.useEffect(() => {
    upCallbackRef.current = () => {
      console.log('UP', interactiveModels, translation)
      if (interactiveModels.length > 0 && translation) {
        const undoFns: (() => {})[] = []
        for (const model of interactiveModels) {
          const originalLocation = getLocation(model)
          const newLocation = getLocation(model, translation)
          console.log(
            'model, translation, original, new',
            model,
            translation,
            originalLocation,
            newLocation
          )
          model.set(newLocation)
          undoFns.push(() => model.set(originalLocation))
        }
        addSnack(
          'Location updated. You may still need to save the item that uses it.',
          {
            id: `${interactiveGeo}.move`,
            undo: () => {
              for (const undoFn of undoFns) {
                undoFn()
              }
            },
          }
        )
      }
      setMoveFrom(null)
      setTranslation(null)
    }
  }, [interactiveModels, translation])

  React.useEffect(() => {
    if (interactiveGeo) {
      // This handler might disable dragging to move the map, so only set it up
      // when the user has started interacting with a geo.
      map.onMouseTrackingForGeoDrag({
        moveFrom,
        down: ({
          position,
          mapLocationId,
        }: {
          position: any
          mapLocationId: number
        }) => {
          if (mapLocationId === interactiveGeo && !Drawing.isDrawing()) {
            setMoveFrom(position)
          }
        },
        move: ({
          translation,
          mapLocationId,
        }: {
          translation?: Translation
          mapLocationId: number
        }) => {
          if (mapLocationId === interactiveGeo) {
            setHoverGeo({
              id: mapLocationId,
            })
          } else {
            setHoverGeo({})
          }
          setTranslation(translation ?? null)
        },
        up: () => upCallbackRef.current?.(),
      })
    }
    return () => map?.clearMouseTrackingForGeoDrag()
  }, [map, interactiveGeo, moveFrom])

  const handleKeydown = React.useCallback((e: any) => {
    if (e.key === 'Escape') {
      setInteractiveGeo(null)
      setInteractiveModels([])
      setMoveFrom(null)
      setTranslation(null)
    }
  }, [])

  React.useEffect(() => {
    if (interactiveGeo) {
      window.addEventListener('keydown', handleKeydown)
    } else {
      window.removeEventListener('keydown', handleKeydown)
    }
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [interactiveGeo])

  React.useEffect(() => {
    if (map && !moveFrom) {
      const handleLeftClick = (mapLocationId?: number) => {
        console.log('handleLeftClick', mapLocationId, moveFrom)
        if (mapLocationId && !interactiveGeo && !Drawing.isDrawing()) {
          setInteractiveGeo(mapLocationId)
        } else {
          setInteractiveGeo(null)
          setInteractiveModels([])
          setMoveFrom(null)
          setTranslation(null)
        }
      }
      map.onLeftClickMapAPI(handleLeftClick)
    }
    if (map && !interactiveGeo) {
      if (!Drawing.isDrawing()) {
        // Clicks used in drawing on the 3D map, so let's ignore them here
        // while drawing.
        map.onDoubleClick()
        map.onRightClick((event: any, _mapEvent: any) => {
          event.preventDefault()
          mapModel.set({
            mouseX: event.offsetX,
            mouseY: event.offsetY,
            open: true,
          })
          mapModel.updateClickCoordinates()
          updateDistance({ map, mapModel, updateOnMenu: true })
        })
      }

      if (mapModel) {
        map.onMouseMove((_event: any, mapEvent: any) => {
          handleMapHover({
            map,
            mapEvent,
            mapModel,
            selectionInterface,
            setIsHoveringResult,
            setHoverGeo,
          })
        })
      }
    }
    return () => {
      map?.clearMouseMove()
      map?.clearDoubleClick()
      map?.clearRightClick()
      map?.clearLeftClickMapAPI()
    }
  }, [map, mapModel, selectionInterface, interactiveGeo, moveFrom])
  return {
    isHoveringResult,
    hoverGeo,
    interactiveGeo,
    setInteractiveGeo,
    moveFrom,
  }
}
const useOnMouseLeave = ({
  mapElement,
  mapModel,
}: {
  mapElement: any
  mapModel: any
}) => {
  React.useEffect(() => {
    if (mapElement && mapModel) {
      mapElement.addEventListener('mouseleave', () => {
        mapModel.clearMouseCoordinates()
      })
    }
  }, [mapElement, mapModel])
}
const useListenToDrawing = () => {
  const [isDrawing, setIsDrawing] = React.useState(false)
  useListenTo(Drawing, 'change:drawing', () => {
    setIsDrawing(Drawing.isDrawing())
  })
  return isDrawing
}
type MapViewReactType = {
  setMap: (map: any) => void
  /*
      Map creation is deferred to this method, so that all resources pertaining to the map can be loaded lazily and
      not be included in the initial page payload.
      Because of this, make sure to return a deferred that will resolve when your respective map implementation
      is finished loading / starting up.
      Also, make sure you resolve that deferred by passing the reference to the map implementation.
    */
  loadMap: () => any
  selectionInterface: any
}
const useChangeCursorOnHover = ({
  mapElement,
  isHoveringResult,
  hoverGeo,
  interactiveGeo,
  moveFrom,
  isDrawing,
}: {
  mapElement: HTMLDivElement | null
  isHoveringResult: boolean
  hoverGeo: HoverGeo
  interactiveGeo: number | null
  moveFrom: Cesium.Cartesian3 | null
  isDrawing: boolean
}) => {
  React.useEffect(() => {
    if (mapElement) {
      const canvas = mapElement.querySelector('canvas')

      if (canvas && !isDrawing) {
        if (interactiveGeo) {
          // If the user is in 'interactive mode' with a geo, only show a special cursor
          // when hovering over that geo.
          if (hoverGeo.id === interactiveGeo) {
            canvas.style.cursor = moveFrom ? 'grabbing' : 'grab'
          } else {
            canvas.style.cursor = ''
          }
        } else if (hoverGeo.interactive || isHoveringResult) {
          canvas.style.cursor = 'pointer'
        } else if (hoverGeo.interactive === false) {
          canvas.style.cursor = 'not-allowed'
        } else {
          canvas.style.cursor = ''
        }
      }
    }
  }, [mapElement, isHoveringResult, hoverGeo, interactiveGeo, moveFrom])
}
const useChangeCursorOnDrawing = ({
  mapElement,
  isDrawing,
}: {
  mapElement: HTMLDivElement | null
  isDrawing: boolean
}) => {
  React.useEffect(() => {
    if (mapElement) {
      const canvas = mapElement.querySelector('canvas')
      if (canvas) {
        if (isDrawing) {
          canvas.style.cursor = 'crosshair'
        } else {
          canvas.style.cursor = ''
        }
      }
    }
  }, [mapElement, isDrawing])
}
export const MapViewReact = (props: MapViewReactType) => {
  const [isClustering, setIsClustering] = React.useState(false)
  const mapModel = useMapModel()
  const [mapDrawingPopupElement, setMapDrawingPopupElement] =
    React.useState<HTMLDivElement | null>(null)
  const [containerElement, setContainerElement] =
    React.useState<HTMLDivElement | null>(null)
  const [mapElement, setMapElement] = React.useState<HTMLDivElement | null>(
    null
  )
  const map = useMap({
    ...props,
    mapElement,
    mapModel,
    containerElement,
    mapDrawingPopupElement,
  })
  React.useEffect(() => {
    props.setMap(map) // allow outside access to map
  }, [map])
  useWreqrMapListeners({ map })
  useSelectionInterfaceMapListeners({
    map,
    selectionInterface: props.selectionInterface,
  })
  useListenToMapModel({ map, mapModel })
  const { isHoveringResult, hoverGeo, interactiveGeo, moveFrom } =
    useMapListeners({
      map,
      mapModel,
      selectionInterface: props.selectionInterface,
    })
  useOnMouseLeave({ mapElement, mapModel })
  const isDrawing = useListenToDrawing()
  useChangeCursorOnDrawing({ mapElement, isDrawing })
  useChangeCursorOnHover({
    isHoveringResult,
    hoverGeo,
    interactiveGeo,
    moveFrom,
    isDrawing,
    mapElement,
  })
  const addSnack = useSnack()
  return (
    <div
      ref={setContainerElement}
      className={`w-full h-full bg-inherit relative p-2`}
    >
      {!map ? (
        <>
          <LinearProgress
            className="absolute left-0 w-full h-2 transform -translate-y-1/2"
            style={{
              top: '50%',
            }}
          />
        </>
      ) : (
        <></>
      )}
      <div id="mapDrawingPopup" ref={setMapDrawingPopupElement}></div>
      <div className="map-context-menu"></div>
      <div id="mapTools">
        {map ? (
          <Geometries
            selectionInterface={props.selectionInterface}
            map={map}
            zoomToHome={zoomToHome}
            isClustering={isClustering}
          />
        ) : null}
        {map ? (
          <MapToolbar
            map={map}
            zoomToHome={() => {
              zoomToHome({ map })
            }}
            saveAsHome={() => {
              const boundingBox = map.getBoundingBox()
              const userPreferences = user.get('user').get('preferences')
              userPreferences.set('mapHome', boundingBox)
              addSnack('Success! New map home location set.', {
                alertProps: {
                  severity: 'success',
                },
              })
            }}
            isClustering={isClustering}
            toggleClustering={() => {
              setIsClustering(!isClustering)
            }}
          />
        ) : null}
        {map ? (
          <>
            <Paper
              elevation={Elevations.overlays}
              className="p-2 z-10 absolute right-0 bottom-0 mr-4 mb-4"
            >
              <div>
                <Button
                  size="small"
                  onClick={() => {
                    map.zoomIn()
                  }}
                >
                  <PlusIcon className="  h-5 w-5" />
                </Button>
              </div>
              <div>
                <Button
                  size="small"
                  onClick={() => {
                    map.zoomOut()
                  }}
                >
                  <MinusIcon className="  h-5 w-5" />
                </Button>
              </div>
            </Paper>
          </>
        ) : null}
      </div>
      <div
        data-id="map-container"
        id="mapContainer"
        className="h-full"
        ref={setMapElement}
      ></div>
      <div className="mapInfo">
        {mapModel ? <MapInfo map={mapModel} /> : null}
      </div>
      <div className="distanceInfo">
        {mapModel ? <DistanceInfo map={mapModel} /> : null}
      </div>
      <div className="popupPreview">
        {map && mapModel && props.selectionInterface ? (
          <>
            <PopupPreview
              map={map}
              mapModel={mapModel}
              selectionInterface={props.selectionInterface}
            />
          </>
        ) : null}
      </div>
      {mapModel ? <MapContextDropdown mapModel={mapModel} /> : null}
    </div>
  )
}
