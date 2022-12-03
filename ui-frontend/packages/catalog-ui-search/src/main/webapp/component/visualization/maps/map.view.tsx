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
import * as React from 'react';
import wreqr from '../../../js/wreqr';
import user from '../../singletons/user-instance';
import MapModel from './map.model';
import MapInfo from '../../../react-component/map-info';
import DistanceInfo from '../../../react-component/distance-info';
import getDistance from 'geolib/es/getDistance';
import { Drawing } from '../../singletons/drawing';
import MapToolbar from './map-toolbar';
import MapContextDropdown from '../../map-context-menu/map-context-menu.view';
import { useListenTo } from '../../selection-checkbox/useBackbone.hook';
import { LazyQueryResult } from '../../../js/model/LazyQueryResult/LazyQueryResult';
import Geometries from './react/geometries';
import LinearProgress from '@material-ui/core/LinearProgress';
import PopupPreview from '../../../react-component/popup-preview';
import { SHAPE_ID_PREFIX } from './drawing-and-display';
import useSnack from '../../hooks/useSnack';
import { zoomToHome } from './home';
import featureDetection from '../../singletons/feature-detection';
const useMapCode = (props: MapViewReactType) => {
    const [mapCode, setMapCode] = React.useState<any>(null);
    React.useEffect(() => {
        props.loadMap().then((Map: any) => {
            setMapCode({ createMap: Map });
        });
    }, [props.loadMap]);
    return mapCode;
};
const useMap = (props: MapViewReactType & {
    mapElement: HTMLDivElement | null;
    mapModel: any;
    containerElement: HTMLDivElement | null;
    mapDrawingPopupElement: HTMLDivElement | null;
}) => {
    const [map, setMap] = React.useState<any>(null);
    const mapCode = useMapCode(props);
    React.useEffect(() => {
        if (props.mapElement && mapCode) {
            try {
                setMap(mapCode.createMap(props.mapElement, props.selectionInterface, props.mapDrawingPopupElement, props.containerElement, props.mapModel));
            }
            catch (err) {
                featureDetection.addFailure('cesium');
            }
        }
        return () => {
            if (props.mapElement && mapCode && map) {
                map.destroy();
            }
        };
    }, [props.mapElement, mapCode]);
    return map;
};
const useMapModel = () => {
    const [mapModel] = React.useState<any>(new MapModel());
    return mapModel;
};
/*
    Handles drawing or clearing the ruler as needed by the measurement state.

    START indicates that a starting point should be drawn,
    so the map clears any previous points drawn and draws a new start point.

    END indicates that an ending point should be drawn,
    so the map draws an end point and a line, and calculates the distance.

    NONE indicates that the ruler should be cleared.
  */
const handleMeasurementStateChange = ({ map, mapModel, }: {
    map: any;
    mapModel: any;
}) => {
    const state = mapModel.get('measurementState');
    let point = null;
    switch (state) {
        case 'START':
            clearRuler({ map, mapModel });
            point = map.addRulerPoint(mapModel.get('coordinateValues'));
            mapModel.addPoint(point);
            mapModel.setStartingCoordinates({
                lat: mapModel.get('coordinateValues')['lat'],
                lon: mapModel.get('coordinateValues')['lon'],
            });
            const polyline = map.addRulerLine(mapModel.get('coordinateValues'));
            mapModel.setLine(polyline);
            break;
        case 'END':
            point = map.addRulerPoint(mapModel.get('coordinateValues'));
            mapModel.addPoint(point);
            map.setRulerLine({
                lat: mapModel.get('coordinateValues')['lat'],
                lon: mapModel.get('coordinateValues')['lon'],
            });
            break;
        case 'NONE':
            clearRuler({ map, mapModel });
            break;
        default:
            break;
    }
};
/*
    Handles tasks for clearing the ruler, which include removing all points
    (endpoints of the line) and the line.
  */
const clearRuler = ({ map, mapModel }: {
    map: any;
    mapModel: any;
}) => {
    const points = mapModel.get('points');
    points.forEach((point: any) => {
        map.removeRulerPoint(point);
    });
    mapModel.clearPoints();
    const line = mapModel.removeLine();
    map.removeRulerLine(line);
};
/*
 *  Redraw and recalculate the ruler line and distanceInfo tooltip. Will not redraw while the menu is currently
 *  displayed updateOnMenu allows updating while the menu is up
 */
const updateDistance = ({ map, mapModel, updateOnMenu = false, }: {
    map: any;
    mapModel: any;
    updateOnMenu?: boolean;
}) => {
    if (mapModel.get('measurementState') === 'START') {
        const openMenu = true; // TODO: investigate this
        const lat = mapModel.get('mouseLat');
        const lon = mapModel.get('mouseLon');
        if ((updateOnMenu === true || !openMenu) && lat && lon) {
            // redraw ruler line
            const mousePoint = { lat, lon };
            map.setRulerLine(mousePoint);
            // update distance info
            const startingCoordinates = mapModel.get('startingCoordinates');
            const dist = getDistance({ latitude: lat, longitude: lon }, {
                latitude: startingCoordinates['lat'],
                longitude: startingCoordinates['lon'],
            });
            mapModel.setDistanceInfoPosition((event as any).clientX, (event as any).clientY);
            mapModel.setCurrentDistance(dist);
        }
    }
};
const useWreqrMapListeners = ({ map }: {
    map: any;
}) => {
    useListenTo(map ? (wreqr as any).vent : undefined, 'metacard:overlay', () => {
        map.overlayImage.bind(map)();
    });
    useListenTo(map ? (wreqr as any).vent : undefined, 'metacard:overlay:remove', () => {
        map.removeOverlay.bind(map)();
    });
    useListenTo(map ? (wreqr as any).vent : undefined, 'search:maprectanglefly', () => {
        map.zoomToExtent.bind(map)();
    });
    React.useEffect(() => {
        if (map) {
        }
    }, [map]);
};
const useSelectionInterfaceMapListeners = ({ map, selectionInterface, }: {
    map: any;
    selectionInterface: any;
}) => {
    useListenTo(map ? selectionInterface : undefined, 'reset:activeSearchResults', () => {
        map.removeAllOverlays.bind(map)();
    });
};
const useListenToMapModel = ({ map, mapModel, }: {
    map: any;
    mapModel: any;
}) => {
    useListenTo(map && mapModel ? mapModel : undefined, 'change:measurementState', () => {
        handleMeasurementStateChange({ map, mapModel });
    });
    useListenTo(map && mapModel ? mapModel : undefined, 'change:mouseLat change:mouseLon', () => {
        updateDistance({ map, mapModel });
    });
};
const updateTarget = ({ mapModel, metacard, }: {
    mapModel: any;
    metacard: LazyQueryResult;
}) => {
    let target;
    let targetMetacard;
    if (metacard) {
        target = metacard.plain.metacard.properties.title;
        targetMetacard = metacard;
    }
    mapModel.set({
        target,
        targetMetacard,
    });
};
const handleMapHover = ({ mapModel, selectionInterface, mapEvent, setIsHovering, }: {
    map: any;
    mapModel: any;
    selectionInterface: any;
    mapEvent: any;
    setIsHovering: (val: boolean) => void;
}) => {
    const currentQuery = selectionInterface.get('currentQuery');
    if (!currentQuery) {
        return;
    }
    const result = currentQuery.get('result');
    if (!result) {
        return;
    }
    const metacard = result.get('lazyResults').results[mapEvent.mapTarget];
    updateTarget({ metacard, mapModel });
    setIsHovering(Boolean(mapEvent.mapTarget &&
        mapEvent.mapTarget !== 'userDrawing' &&
        (mapEvent.mapTarget.constructor === Array ||
            (mapEvent.mapTarget.constructor === String &&
                !(mapEvent.mapTarget as string).startsWith(SHAPE_ID_PREFIX)))));
};
const useMapListeners = ({ map, mapModel, selectionInterface, }: {
    map: any;
    mapModel: any;
    selectionInterface: any;
}) => {
    const [isHovering, setIsHovering] = React.useState(false);
    React.useEffect(() => {
        if (map && mapModel && selectionInterface) {
            map.onMouseMove((_event: any, mapEvent: any) => {
                handleMapHover({
                    map,
                    mapEvent,
                    mapModel,
                    selectionInterface,
                    setIsHovering,
                });
            });
            map.onRightClick((event: any, _mapEvent: any) => {
                event.preventDefault();
                mapModel.set({
                    mouseX: event.offsetX,
                    mouseY: event.offsetY,
                    open: true,
                });
                mapModel.updateClickCoordinates();
                updateDistance({ map, mapModel, updateOnMenu: true });
            });
        }
    }, [map, mapModel, selectionInterface]);
    return {
        isHovering,
    };
};
const useOnMouseLeave = ({ mapElement, mapModel, }: {
    mapElement: any;
    mapModel: any;
}) => {
    React.useEffect(() => {
        if (mapElement && mapModel) {
            mapElement.addEventListener('mouseleave', () => {
                mapModel.clearMouseCoordinates();
            });
        }
    }, [mapElement, mapModel]);
};
const useListenToDrawing = () => {
    const [isDrawing, setIsDrawing] = React.useState(false);
    useListenTo(Drawing, 'change:drawing', () => {
        setIsDrawing(Drawing.isDrawing());
    });
    return isDrawing;
};
type MapViewReactType = {
    setMap: (map: any) => void;
    /*
      Map creation is deferred to this method, so that all resources pertaining to the map can be loaded lazily and
      not be included in the initial page payload.
      Because of this, make sure to return a deferred that will resolve when your respective map implementation
      is finished loading / starting up.
      Also, make sure you resolve that deferred by passing the reference to the map implementation.
    */
    loadMap: () => any;
    selectionInterface: any;
};
const useChangeCursorOnHover = ({ mapElement, isHovering, }: {
    mapElement: HTMLDivElement | null;
    isHovering: boolean;
}) => {
    React.useEffect(() => {
        if (mapElement) {
            const canvas = mapElement.querySelector('canvas');
            if (canvas) {
                if (isHovering) {
                    canvas.classList.add('cursor-pointer');
                }
                else {
                    canvas.classList.remove('cursor-pointer');
                }
            }
        }
    }, [mapElement, isHovering]);
};
const useChangeCursorOnDrawing = ({ mapElement, isDrawing, }: {
    mapElement: HTMLDivElement | null;
    isDrawing: boolean;
}) => {
    React.useEffect(() => {
        if (mapElement) {
            const canvas = mapElement.querySelector('canvas');
            if (canvas) {
                if (isDrawing) {
                    canvas.style.cursor = 'crosshair';
                }
                else {
                    canvas.style.cursor = '';
                }
            }
        }
    }, [mapElement, isDrawing]);
};
export const MapViewReact = (props: MapViewReactType) => {
    const [isClustering, setIsClustering] = React.useState(false);
    const mapModel = useMapModel();
    const [mapDrawingPopupElement, setMapDrawingPopupElement,] = React.useState<HTMLDivElement | null>(null);
    const [containerElement, setContainerElement,] = React.useState<HTMLDivElement | null>(null);
    const [mapElement, setMapElement] = React.useState<HTMLDivElement | null>(null);
    const map = useMap({
        ...props,
        mapElement,
        mapModel,
        containerElement,
        mapDrawingPopupElement,
    });
    React.useEffect(() => {
        props.setMap(map); // allow outside access to map
    }, [map]);
    useWreqrMapListeners({ map });
    useSelectionInterfaceMapListeners({
        map,
        selectionInterface: props.selectionInterface,
    });
    useListenToMapModel({ map, mapModel });
    const { isHovering } = useMapListeners({
        map,
        mapModel,
        selectionInterface: props.selectionInterface,
    });
    useOnMouseLeave({ mapElement, mapModel });
    useChangeCursorOnHover({ isHovering, mapElement });
    const isDrawing = useListenToDrawing();
    useChangeCursorOnDrawing({ mapElement, isDrawing });
    const addSnack = useSnack();
    return (<div ref={setContainerElement} className={`w-full h-full bg-inherit relative p-2`}>
      {!map ? (<>
          <LinearProgress className="absolute left-0 w-full h-2 transform -translate-y-1/2" style={{
                top: '50%',
            }}/>
        </>) : (<></>)}
      <div id="mapDrawingPopup" ref={setMapDrawingPopupElement}></div>
      <div className="map-context-menu"></div>
      <div id="mapTools">
        {map ? (<Geometries selectionInterface={props.selectionInterface} map={map} zoomToHome={zoomToHome} isClustering={isClustering}/>) : null}
        {map ? (<MapToolbar map={map} zoomToHome={() => {
                zoomToHome({ map });
            }} saveAsHome={() => {
                const boundingBox = map.getBoundingBox();
                const userPreferences = user.get('user').get('preferences');
                userPreferences.set('mapHome', boundingBox);
                addSnack('Success! New map home location set.', {
                    alertProps: {
                        severity: 'success',
                    },
                });
            }} isClustering={isClustering} toggleClustering={() => {
                setIsClustering(!isClustering);
            }}/>) : null}
      </div>
      <div data-id="map-container" id="mapContainer" className="h-full" ref={setMapElement}></div>
      <div className="mapInfo">
        {mapModel ? <MapInfo map={mapModel}/> : null}
      </div>
      <div className="distanceInfo">
        {mapModel ? <DistanceInfo map={mapModel}/> : null}
      </div>
      <div className="popupPreview">
        {map && mapModel && props.selectionInterface ? (<>
            <PopupPreview map={map} mapModel={mapModel} selectionInterface={props.selectionInterface}/>
          </>) : null}
      </div>
      {mapModel ? <MapContextDropdown mapModel={mapModel}/> : null}
    </div>);
};
