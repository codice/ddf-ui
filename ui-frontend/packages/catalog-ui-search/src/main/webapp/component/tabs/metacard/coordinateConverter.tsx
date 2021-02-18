import { TypedUserInstance } from '../../singletons/TypedUser'
const mtgeo = require('mt-geo')
const usngs = require('usng.js')
const converter = new usngs.Converter()

const usngPrecision = 6

/**
 * Converts wkt to the user's preferred coordinate format.
 * Falls back to the wkt if the conversion fails.
 */
export const convertWktToPreferredCoordFormat = (wkt: string) => {
  const coords = wkt.split(/\s/g)

  if (coords.length !== 2) {
    return wkt
  }

  // must be in number format for LLtoUTMUPS converter
  const lon = parseFloat(coords[0])
  const lat = parseFloat(coords[1])

  if (isNaN(lon) || isNaN(lat)) {
    return wkt
  } else {
    return convertCoordsToPreferred(lat, lon)
  }
}

/**
 * Converts coordinates from lat lon to a single string in
 * the user's preferred format
 */
export const convertCoordsToPreferred = (lat: number, lon: number): string => {
  const coordFormat = TypedUserInstance.getCoordinateFormat()

  try {
    switch (coordFormat) {
      case 'degrees':
        return `${mtgeo.toLat(lat)} ${mtgeo.toLon(lon)}`
      case 'decimal':
        return `${lat} ${lon}`
      case 'mgrs':
        // display dms format inUPSSpace
        return converter.isInUPSSpace(lat)
          ? `${mtgeo.toLat(lat)} ${mtgeo.toLon(lon)}`
          : converter.LLtoUSNG(lat, lon, usngPrecision)
      case 'utm':
        return converter.LLtoUTMUPS(lat, lon)
      case 'wkt':
      default:
        return `${lon} ${lat}`
    }
  } catch (e) {
    return `${lon} ${lat}`
  }
}
