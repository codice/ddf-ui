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
import React from 'react';
import DistanceUtils from '../../../../js/DistanceUtils';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium';
import wreqr from '../../../../js/wreqr';
import _ from 'underscore';
const enableInput = ({ map }: {
    map: any;
}) => {
    const controller = map.getMap().scene.screenSpaceCameraController;
    controller.enableTranslate = true;
    controller.enableZoom = true;
    controller.enableRotate = true;
    controller.enableTilt = true;
    controller.enableLook = true;
};
const disableInput = ({ map }: {
    map: any;
}) => {
    const controller = map.getMap().scene.screenSpaceCameraController;
    controller.enableTranslate = false;
    controller.enableZoom = false;
    controller.enableRotate = false;
    controller.enableTilt = false;
    controller.enableLook = false;
};
const setModelFromClicks = ({ model, mn, mx, crossDateLine, lastLongitude, dir, }: {
    model: any;
    mn: any;
    mx: any;
    map: any;
    crossDateLine: any;
    lastLongitude: any;
    dir: undefined | 'east' | 'west';
}) => {
    let e = new Cesium.Rectangle(), epsilon = Cesium.Math.EPSILON14, modelProps;
    if (!lastLongitude) {
        crossDateLine = false;
        lastLongitude = mx.longitude;
    }
    else {
        if (lastLongitude > 0 && mx.longitude > 0 && mn.longitude > 0) {
            //west of the date line
            crossDateLine = false;
            //track direction of the bbox
            if (lastLongitude > mx.longitude) {
                if (dir === 'east') {
                    if (mx.longitude < mn.longitude) {
                        dir = 'west';
                    }
                }
                else {
                    dir = 'west';
                }
            }
            else if (lastLongitude < mx.longitude) {
                if (dir === 'west') {
                    if (mx.longitude > mn.longitude) {
                        dir = 'east';
                    }
                }
                else {
                    dir = 'east';
                }
            }
        }
        else if (lastLongitude > 0 && mx.longitude < 0 && mn.longitude > 0) {
            //crossed date line from west to east
            crossDateLine = !(dir && dir === 'west');
        }
        else if (lastLongitude < 0 && mx.longitude > 0 && mn.longitude > 0) {
            //moved back across date line to same quadrant
            crossDateLine = false;
        }
        else if (lastLongitude < 0 && mx.longitude < 0 && mn.longitude < 0) {
            //east of the date line
            crossDateLine = false;
            //track direction of the bbox
            if (lastLongitude < mx.longitude) {
                if (dir === 'west') {
                    if (mx.longitude > mn.longitude) {
                        dir = 'east';
                    }
                }
                else {
                    dir = 'east';
                }
            }
            else if (lastLongitude > mx.longitude) {
                if (dir === 'east') {
                    if (mx.longitude < mn.longitude) {
                        dir = 'west';
                    }
                }
                else {
                    dir = 'west';
                }
            }
        }
        else if (lastLongitude < 0 && mx.longitude > 0 && mn.longitude < 0) {
            //crossed date line from east to west
            crossDateLine = !(dir && dir === 'east');
        }
        else if (lastLongitude > 0 && mx.longitude < 0 && mn.longitude < 0) {
            //moved back across date line to same quadrant
            crossDateLine = false;
        }
        lastLongitude = mx.longitude;
    }
    // Re-order so west < east and south < north
    if (crossDateLine) {
        e.east = Math.min(mn.longitude, mx.longitude);
        e.west = Math.max(mn.longitude, mx.longitude);
    }
    else {
        e.east = Math.max(mn.longitude, mx.longitude);
        e.west = Math.min(mn.longitude, mx.longitude);
    }
    e.south = Math.min(mn.latitude, mx.latitude);
    e.north = Math.max(mn.latitude, mx.latitude);
    // Check for approx equal (shouldn't require abs due to
    // re-order)
    if (e.east - e.west < epsilon) {
        e.east += epsilon * 2.0;
    }
    if (e.north - e.south < epsilon) {
        e.north += epsilon * 2.0;
    }
    modelProps = _.pick(e, 'north', 'east', 'west', 'south');
    _.each(modelProps, (val: any, key: any) => {
        modelProps[key] = DistanceUtils.coordinateRound((val * 180) / Math.PI);
    });
    model.set(modelProps);
    return {
        dir,
        lastLongitude,
        crossDateLine,
    };
};
const useStartMapDrawing = ({ map, model }: {
    map: any;
    model: any;
}) => {
    React.useEffect(() => {
        if (map && model) {
            const mouseHandler = new Cesium.ScreenSpaceEventHandler(map.getMap().scene.canvas);
            disableInput({ map });
            mouseHandler.setInputAction((movement: any) => {
                const cartesian = map
                    .getMap()
                    .scene.camera.pickEllipsoid(movement.position, map.getMap().scene.globe.ellipsoid);
                if (cartesian) {
                    const click1 = map
                        .getMap()
                        .scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                    let dir = undefined as any;
                    let lastLongitude = undefined as any;
                    let crossDateLine = undefined as any;
                    mouseHandler.setInputAction(() => {
                        enableInput({ map });
                        if (!mouseHandler.isDestroyed()) {
                            mouseHandler.destroy();
                        }
                        model.trigger('EndExtent', model);
                        (wreqr as any).vent.trigger('search:bboxdisplay', model);
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);
                    mouseHandler.setInputAction((movement: any) => {
                        let cartesian = map
                            .getMap()
                            .scene.camera.pickEllipsoid(movement.endPosition, map.getMap().scene.globe.ellipsoid), cartographic;
                        if (cartesian) {
                            cartographic = map
                                .getMap()
                                .scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                            const updates = setModelFromClicks({
                                mn: click1,
                                mx: cartographic,
                                model,
                                map,
                                dir,
                                lastLongitude,
                                crossDateLine,
                            });
                            dir = updates.dir;
                            (lastLongitude = updates.lastLongitude),
                                (crossDateLine = updates.crossDateLine);
                        }
                    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
            return () => {
                mouseHandler.destroy();
                enableInput({ map });
            };
        }
        return () => { };
    }, [map, model]);
};
export const CesiumBboxDrawing = ({ map, model }: {
    map: any;
    model: any;
}) => {
    useStartMapDrawing({ map, model });
    React.useEffect(() => {
        return () => {
            if (map && model) {
                map.getMap().drawHelper.stopDrawing();
            }
        };
    }, [map, model]);
    return <></>;
};
