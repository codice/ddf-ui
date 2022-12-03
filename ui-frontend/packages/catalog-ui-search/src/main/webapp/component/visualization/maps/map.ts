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

import _ from 'underscore';

function throwUnimplementedException() {
  throw 'Method has not been implemented.'
}

const exposedMethods = [
  'onLeftClick',
  'onRightClick',
  'onMouseDown',
  'onMouseMove',
  'onCameraMoveStart',
  'onCameraMoveEnd',
  'zoomToSelected',
  'showResults',
  'panToExtent',
  'panToShapesExtent',
  'panToResults',
  'zoomToExtent',
  'zoomToHome',
  'overlayImage',
  'removeOverlay',
  'removeAllOverlays',
  'getCartographicCenterOfClusterInDegrees',
  'getWindowLocationsOfResults',
  'addPointWithText',
  'addPoint',
  'addLine',
  'addPolygon',
  'updateCluster',
  'updateGeometry',
  'hideGeometry',
  'showGeometry',
  'removeGeometry',
  'destroy',
]

const interfaceImplementation = exposedMethods.reduce(
  (implementations, methodName) => {
    implementations[methodName] = throwUnimplementedException
    return implementations
  },
  {}
)

export default function MapCommunication() {
  return _.extend({}, interfaceImplementation)
};
