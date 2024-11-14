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
import { StartupDataStore } from '../../../js/model/Startup/startup'
import wrapNum from '../../../react-component/utils/wrap-num/wrap-num'
import { TypedUserInstance } from '../../singletons/TypedUser'
const homeBoundingBox = getBoundingBox(getHomeCoordinates())
const defaultHomeBoundingBox = {
  west: -128,
  south: 24,
  east: -63,
  north: 52,
}
export const getHome = () => {
  return [
    TypedUserInstance.getMapHome(),
    homeBoundingBox,
    defaultHomeBoundingBox,
  ].find((element) => element !== undefined)
}
export const zoomToHome = ({ map }: { map: any }) => {
  const home = getHome()
  map.zoomToBoundingBox(home)
}
function findExtreme({ objArray, property, comparator }: any) {
  if (objArray.length === 0) {
    return undefined
  }
  return objArray.reduce(
    (extreme: any, coordinateObj: any) =>
      (extreme = comparator(extreme, coordinateObj[property])),
    objArray[0][property]
  )
}
function getBoundingBox(coordinates: any) {
  const north = findExtreme({
    objArray: coordinates,
    property: 'lat',
    comparator: Math.max,
  })
  const south = findExtreme({
    objArray: coordinates,
    property: 'lat',
    comparator: Math.min,
  })
  const east = findExtreme({
    objArray: coordinates,
    property: 'lon',
    comparator: Math.max,
  })
  const west = findExtreme({
    objArray: coordinates,
    property: 'lon',
    comparator: Math.min,
  })
  if (
    north === undefined ||
    south === undefined ||
    east === undefined ||
    west === undefined
  ) {
    return undefined
  }
  return {
    north,
    east,
    south,
    west,
  }
}
function getHomeCoordinates() {
  if (
    StartupDataStore.Configuration.getMapHome() !== '' &&
    StartupDataStore.Configuration.getMapHome() !== undefined
  ) {
    const separateCoordinates = StartupDataStore.Configuration.getMapHome()
      .replace(/\s/g, '')
      .split(',')
    if (separateCoordinates.length % 2 === 0) {
      return separateCoordinates
        .reduce((coordinates: any, coordinate: any, index: any) => {
          if (index % 2 === 0) {
            coordinates.push({
              lon: coordinate,
              lat: separateCoordinates[index + 1],
            })
          }
          return coordinates
        }, [])
        .map((coordinateObj: any) => {
          let lon = parseFloat(coordinateObj.lon)
          let lat = parseFloat(coordinateObj.lat)
          if (isNaN(lon) || isNaN(lat)) {
            return undefined
          }
          lon = wrapNum(lon, -180, 180)
          lat = wrapNum(lat, -90, 90)
          return {
            lon,
            lat,
          }
        })
        .filter((coordinateObj: any) => {
          return coordinateObj !== undefined
        })
    }
  } else {
    return []
  }
}
