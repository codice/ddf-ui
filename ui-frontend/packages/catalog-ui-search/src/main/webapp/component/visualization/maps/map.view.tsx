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
    mapLayers: any
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
            props.mapModel,
            props.mapLayers
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
        (Array.isArray(mapEvent.mapTarget) ||
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
        'mapWest',
        'north',
        'south',
        'east',
        'west'
      )
      if (translation) {
        const translatedBbox = translateBbox(bbox, translation)
        return translatedBbox
      }
      return bbox
    case 'circle':
      const point = _.pick(model.attributes, 'lat', 'lon')
      if (translation) {
        const translatedPoint = translatePoint(
          point.lon,
          point.lat,
          translation
        )
        return translatedPoint
      }
      return point
    case 'line':
      const line = JSON.parse(JSON.stringify(model.get('line')))
      if (translation) {
        translateLine(line, translation)
      }
      return { line }
    case 'poly':
      const polygon = JSON.parse(JSON.stringify(model.get('polygon')))
      if (translation) {
        const multiPolygon = ShapeUtils.isArray3D(polygon) ? polygon : [polygon]
        translatePolygon(multiPolygon, translation)
      }
      return { polygon }
    default:
      return {}
  }
}

type LonLat = [longitude: number, latitude: number]

const translatePolygon = (polygon: LonLat[][], translation: Translation) => {
  // odd things happen when latitude is exactly or very close to either 90 or -90
  const northPole = 89.99
  const southPole = -89.99
  let maxLat = 0
  let minLat = 0
  let diff = 0

  for (const ring of polygon) {
    for (const coord of ring) {
      const [lon, lat] = translateCoordinates(coord[0], coord[1], translation)
      coord[0] = lon
      coord[1] = lat
      maxLat = Math.max(lat, maxLat)
      minLat = Math.min(lat, minLat)
    }
  }

  if (maxLat > northPole) {
    diff = Math.abs(maxLat - northPole)
  } else if (minLat < southPole) {
    diff = -Math.abs(minLat - southPole)
  }

  if (diff !== 0) {
    for (const ring of polygon) {
      for (const coord of ring) {
        coord[1] -= diff
      }
    }
  }
}

const translateLine = (line: LonLat[], translation: Translation) => {
  // odd things happen when latitude is exactly or very close to either 90 or -90
  const northPole = 89.99
  const southPole = -89.99
  let maxLat = 0
  let minLat = 0
  let diff = 0
  for (const coord of line) {
    const [lon, lat] = translateCoordinates(coord[0], coord[1], translation)
    maxLat = Math.max(lat, maxLat)
    minLat = Math.min(lat, minLat)
    coord[0] = lon
    coord[1] = lat
  }

  // prevent polar crossing
  if (maxLat > northPole) {
    diff = Math.abs(maxLat - northPole)
  } else if (minLat < southPole) {
    diff = -Math.abs(minLat - southPole)
  }

  if (diff !== 0) {
    for (const coord of line) {
      coord[1] -= diff
    }
  }
}

type bboxCoords = {
  mapNorth: number
  mapSouth: number
  mapEast: number
  mapWest: number
  north?: number
  south?: number
  east?: number
  west?: number
}

const translateBbox = (
  bbox: bboxCoords,
  translation: Translation
): bboxCoords => {
  const translated = { ...bbox }
  let [east, north] = translateCoordinates(
    bbox.mapEast,
    bbox.mapNorth,
    translation
  )
  let [west, south] = translateCoordinates(
    bbox.mapWest,
    bbox.mapSouth,
    translation
  )

  const northPole = 90
  const southPole = -90

  // prevent polar crossing
  let diff
  if (north > northPole) {
    diff = Math.abs(north - northPole)
    north = northPole
    south = south - diff
  }

  if (south < southPole) {
    diff = Math.abs(southPole - south)
    south = southPole
    north = north + diff
  }

  translated.mapNorth = north
  translated.mapEast = east
  translated.mapSouth = south
  translated.mapWest = west

  translated.north = north
  translated.east = east
  translated.south = south
  translated.west = west

  return translated
}

const translatePoint = (
  lon: number,
  lat: number,
  translation: Translation
): { lon: number; lat: number } => {
  let [updatedLon, updatedLat] = translateCoordinates(lon, lat, translation)
  const northPole = 89.99
  const southPole = -89.99

  if (updatedLat > northPole) {
    updatedLat = northPole
  } else if (updatedLat < southPole) {
    updatedLat = southPole
  }
  return { lon: updatedLon, lat: updatedLat }
}

const translateCoordinates = (
  longitude: number,
  latitude: number,
  translation: Translation
): LonLat => {
  let translatedLon = longitude + translation.longitude
  let translatedLat = latitude + translation.latitude

  // normalize longitude
  if (translatedLon > 180) {
    translatedLon -= 360
  }
  if (translatedLon < -180) {
    translatedLon += 360
  }

  return [translatedLon, translatedLat]
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

  const upCallbackRef = React.useRef<(() => void) | null>(null)

  React.useEffect(() => {
    upCallbackRef.current = () => {
      if (interactiveModels.length > 0 && translation) {
        const undoFns: (() => {})[] = []
        for (const model of interactiveModels) {
          const originalLocation = getLocation(model)
          const newLocation = getLocation(model, translation)
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
  mapLayers: any
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
            isClustering={isClustering}
          />
        ) : null}
        {map ? (
          <MapToolbar
            map={map}
            mapLayers={props.mapLayers}
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
