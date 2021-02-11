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
import React, { useState, useEffect } from 'react'
import {
  ErrorComponent,
  validateGeo,
  initialErrorState,
} from '../utils/validation'
import Button from '@material-ui/core/Button'
import CloseIcon from '@material-ui/icons/Close'
import {
  validateUsngLineOrPoly,
  validateDmsLineOrPoly,
  validateUtmUpsLineOrPoly,
  parseDmsCoordinate,
} from './validators'
import DmsTextField from './dms-textfield'
import UtmupsTextField from './utmups-textfield'
const { Units } = require('./common')
const TextField = require('../text-field')
const { Radio, RadioItem } = require('../radio')
const { MinimumSpacing } = require('./common')
const _ = require('underscore')

const usngs = require('usng.js')
const converter = new usngs.Converter()
const usngPrecision = 6
const dmsUtils = require('../../component/location-new/utils/dms-utils.js')

const coordinatePairRegex = /-?\d{1,3}(\.\d*)?\s-?\d{1,3}(\.\d*)?/g

function buildWktString(coordinates) {
  return '[[' + coordinates.join('],[') + ']]'
}

function convertWktString(value) {
  if (value.includes('MULTI')) {
    return convertMultiWkt(value.includes('POLYGON'), value)
  } else if (value.includes('POLYGON') && value.endsWith('))')) {
    return convertWkt(value, 4)
  } else if (value.includes('LINESTRING') && value.endsWith(')')) {
    return convertWkt(value, 2)
  }
  return value
}

function convertWkt(value, numCoords) {
  const coordinatePairs = value.match(coordinatePairRegex)
  if (!coordinatePairs || coordinatePairs.length < numCoords) {
    return value
  }
  const coordinates = coordinatePairs.map((coord) => coord.replace(' ', ','))
  return buildWktString(coordinates)
}

function convertMultiWkt(isPolygon, value) {
  if (isPolygon && !value.endsWith(')))')) {
    return value
  } else if (!value.endsWith('))')) {
    return value
  }
  const splitter = isPolygon ? '))' : ')'
  const numPoints = isPolygon ? 4 : 2
  let shapes = value
    .split(splitter)
    .map((shape) => shape.match(coordinatePairRegex))
  shapes = shapes
    .filter((shape) => shape !== null && shape.length >= numPoints)
    .map((shape) =>
      shape.map((coordinatePair) => coordinatePair.replace(' ', ','))
    )
  return shapes.length === 0
    ? value
    : shapes.length === 1
    ? buildWktString(shapes[0])
    : '[' + shapes.map((shapeCoords) => buildWktString(shapeCoords)) + ']'
}

function getPolygonValue(currentValue, value) {
  // if current value's 1st coord is different
  // from value's first coord, then delete value's last coord
  try {
    const parsedValue = JSON.parse(value)
    const parsedCurrentValue = JSON.parse(currentValue)
    if (
      Array.isArray(parsedValue) &&
      Array.isArray(parsedCurrentValue) &&
      !_.isEqual(parsedValue[0], parsedCurrentValue[0])
    ) {
      parsedValue.splice(-1, 1)
      return JSON.stringify(parsedValue)
    } else {
      return value
    }
  } catch (e) {
    return value
  }
}

const LineLatLon = (props) => {
  const {
    label,
    geometryKey,
    setState,
    setBufferState,
    unitKey,
    widthKey,
    mode,
    polyType,
  } = props
  const [currentValue, setCurrentValue] = useState(
    JSON.stringify(props[geometryKey])
  )
  const [baseLineError, setBaseLineError] = useState(initialErrorState)
  const [bufferError, setBufferError] = useState(initialErrorState)

  useEffect(() => {
    const { geometryKey } = props
    setCurrentValue(
      typeof props[geometryKey] === 'string'
        ? props[geometryKey]
        : JSON.stringify(props[geometryKey])
    )
    if (props.drawing) {
      setBaseLineError(initialErrorState)
    }
  }, [props.polygon, props.line])

  return (
    <div>
      <div className="input-location">
        <TextField
          label={label}
          value={currentValue}
          onChange={(value) => {
            value = convertWktString(value.trim())
            if (geometryKey.includes('poly')) {
              value = getPolygonValue(currentValue, value)
            }
            setCurrentValue(value)
            try {
              setState({ [geometryKey]: JSON.parse(value) })
            } catch (e) {
              // Set state with invalid value to trigger error messaging
              setState({ [geometryKey]: value })
            }
          }}
          onBlur={() =>
            setBaseLineError(validateGeo(mode || polyType, currentValue))
          }
        />
        <ErrorComponent errorState={baseLineError} />
        <Units
          value={props[unitKey]}
          onChange={(value) => {
            typeof setBufferState === 'function'
              ? setBufferState(unitKey, value)
              : setState({ [unitKey]: value })
            if (widthKey === 'lineWidth' || 'bufferWidth') {
              setBufferError(
                validateGeo(widthKey, {
                  value: props[widthKey],
                  units: value,
                })
              )
            }
          }}
        >
          <TextField
            type="number"
            label="Buffer width"
            value={String(props[widthKey])}
            onChange={(value) => {
              typeof setBufferState === 'function'
                ? setBufferState(widthKey, value)
                : setState({ [widthKey]: value })
            }}
            onBlur={(e) => {
              setBufferError(
                validateGeo(widthKey, {
                  value: e.target.value,
                  units: props[unitKey],
                })
              )
            }}
          />
        </Units>
        <ErrorComponent errorState={bufferError} />
      </div>
    </div>
  )
}

const LineDms = (props) => {
  const {
    geometryKey,
    dmsPointArray,
    setState,
    unitKey,
    setBufferState,
    widthKey,
  } = props
  const [points, setPoints] = useState(dmsPointArray || [])
  const [baseLineError, setBaseLineError] = useState(initialErrorState)
  const [bufferError, setBufferError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setBaseLineError(initialErrorState)
    }
    if (dmsPointArray) {
      setPoints(dmsPointArray)
    }
  }, [props.polygon, props.line])

  useEffect(() => {
    let validation = validateDmsLineOrPoly(points, geometryKey)
    let llPoints = convertDmsToLLPoints(!validation.error, points)
    setState({ ['dmsPointArray']: points })
    //Maybe only set this if it's empty so we don't have to convert twice?
    setState({ [geometryKey]: llPoints })
    setBaseLineError(validation)
  }, [points])

  return (
    <div>
      <div className="input-location">
        {points.map((point, index) => {
          return (
            <div>
              <DmsTextField
                key={'point-' + index}
                point={point}
                setPoint={(point) => {
                  points.splice(index, 1, point)
                  setPoints([...points])
                }}
                deletePoint={() => {
                  points.splice(index, 1)
                  setPoints([...points])
                }}
              />
              <MinimumSpacing />
            </div>
          )
        })}
      </div>
      <Button
        fullWidth
        variant="contained"
        className="is-primary" //match styling of other buttons here
        onClick={() => {
          points.push({
            lat: '',
            lon: '',
            latDirection: 'N',
            lonDirection: 'E',
          })
          setPoints([...points])
        }}
      >
        +
      </Button>
      <ErrorComponent errorState={baseLineError} />
      <Units
        value={props[unitKey]}
        onChange={(value) => {
          typeof setBufferState === 'function'
            ? setBufferState(unitKey, value)
            : setState({ [unitKey]: value })
          if (widthKey === 'lineWidth' || 'bufferWidth') {
            setBufferError(
              validateGeo(widthKey, {
                value: props[widthKey],
                units: value,
              })
            )
          }
        }}
      >
        <TextField
          type="number"
          label="Buffer width"
          value={String(props[widthKey])}
          onChange={(value) => {
            typeof setBufferState === 'function'
              ? setBufferState(widthKey, value)
              : setState({ [widthKey]: value })
          }}
          onBlur={(e) => {
            setBufferError(
              validateGeo(widthKey, {
                value: e.target.value,
                units: props[unitKey],
              })
            )
          }}
        />
      </Units>
      <ErrorComponent errorState={bufferError} />
    </div>
  )
}

const LineMgrs = (props) => {
  const {
    geometryKey,
    usngPointArray,
    setState,
    unitKey,
    setBufferState,
    widthKey,
  } = props
  const [points, setPoints] = useState(usngPointArray || [])
  const [baseLineError, setBaseLineError] = useState(initialErrorState)
  const [bufferError, setBufferError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setBaseLineError(initialErrorState)
    }
    if (usngPointArray) {
      setPoints(usngPointArray)
    }
  }, [props.polygon, props.line])

  useEffect(() => {
    let validation = validateUsngLineOrPoly(points, geometryKey)
    let llPoints = convertToLLPoints(!validation.error, points)
    setState({ ['usngPointArray']: points })
    setState({ [geometryKey]: llPoints })
    setBaseLineError(validation)
  }, [points])

  return (
    <div>
      <div className="input-location">
        {points &&
          points.map((coord, index) => {
            return (
              <TextField
                key={'grid-' + index}
                label="Grid"
                value={coord}
                onChange={(value) => {
                  points.splice(index, 1, value)
                  setPoints([...points])
                }}
                onBlur={() => {
                  setBaseLineError(validateUsngLineOrPoly(points, geometryKey))
                }}
                addon={
                  <Button
                    onClick={() => {
                      points.splice(index, 1)
                      setPoints([...points])
                    }}
                  >
                    <CloseIcon />
                  </Button>
                }
              />
            )
          })}
        <Button
          fullWidth
          variant="contained"
          className="is-primary" //match styling of other buttons here
          onClick={() => {
            points.push('')
            setPoints([...points])
          }}
        >
          +
        </Button>
        <ErrorComponent errorState={baseLineError} />
        <Units
          value={props[unitKey]}
          onChange={(value) => {
            typeof setBufferState === 'function'
              ? setBufferState(unitKey, value)
              : setState({ [unitKey]: value })
            if (widthKey === 'lineWidth' || 'bufferWidth') {
              setBufferError(
                validateGeo(widthKey, {
                  value: props[widthKey],
                  units: value,
                })
              )
            }
          }}
        >
          <TextField
            type="number"
            label="Buffer width"
            value={String(props[widthKey])}
            onChange={(value) => {
              typeof setBufferState === 'function'
                ? setBufferState(widthKey, value)
                : setState({ [widthKey]: value })
            }}
            onBlur={(e) => {
              setBufferError(
                validateGeo(widthKey, {
                  value: e.target.value,
                  units: props[unitKey],
                })
              )
            }}
          />
        </Units>
        <ErrorComponent errorState={bufferError} />
      </div>
    </div>
  )
}

const LineUtmUps = (props) => {
  const {
    geometryKey,
    utmUpsPointArray,
    setState,
    unitKey,
    setBufferState,
    widthKey,
  } = props

  const [points, setPoints] = useState(utmUpsPointArray || [])
  const [baseLineError, setBaseLineError] = useState(initialErrorState)
  const [bufferError, setBufferError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setBaseLineError(initialErrorState)
    }
    if (utmUpsPointArray) {
      setPoints(utmUpsPointArray)
    }
  }, [props.polygon, props.line])

  useEffect(() => {
    let validation = validateUtmUpsLineOrPoly(points, geometryKey)
    let llPoints = convertUtmUpsToLLPoints(!validation.error, points)
    setState({ ['utmUpsPointArray']: points })
    setState({ [geometryKey]: llPoints })
    setBaseLineError(validation)
  }, [points])

  return (
    <div>
      {points.map((point, index) => {
        return (
          <div>
            <UtmupsTextField
              point={point}
              setPoint={(point) => {
                points.splice(index, 1, point)
                setPoints([...points])
              }}
              deletePoint={() => {
                points.splice(index, 1)
                setPoints([...points])
              }}
            />
            <MinimumSpacing />
          </div>
        )
      })}
      <Button
        fullWidth
        variant="contained"
        className="is-primary" //match styling of other buttons here
        onClick={() => {
          points.push({
            easting: undefined,
            hemisphere: 'Northern',
            northing: undefined,
            zoneNumber: 0,
          })
          setPoints([...points])
        }}
      >
        +
      </Button>
      <ErrorComponent errorState={baseLineError} />
    </div>
  )
}

const convertToLLPoints = (valid, points) => {
  if (valid) {
    const llPoints = points.map((point) => {
      // A little bit unintuitive, but lat/lon is swapped here
      const convertedPoint = converter.USNGtoLL(point, usngPrecision)
      return [convertedPoint.lon, convertedPoint.lat]
    })
    return llPoints
  } else return undefined
}

const convertDmsToLLPoints = (valid, points) => {
  if (valid) {
    const llPoints = points.map((point) => {
      let latCoordinate = dmsUtils.dmsCoordinateToDD({
        ...parseDmsCoordinate(point.lat),
        direction: point.latDirection,
      })
      let lonCoordinate = dmsUtils.dmsCoordinateToDD({
        ...parseDmsCoordinate(point.lon),
        direction: point.lonDirection,
      })
      // A little bit unintuitive, but lat/lon is swapped here
      return [lonCoordinate, latCoordinate]
    })
    return llPoints
  } else return undefined
}

const convertUtmUpsToLLPoints = (valid, points) => {
  if (valid) {
    const llPoints = points.map((point) => {
      const northPole =
        (point.hemisphere === 'NORTHERN') | 'Northern' ? true : false
      const convertedPoint = converter.UTMUPStoLL({
        northPole,
        zoneNumber: point.zoneNumber,
        easting: point.easting,
        northing: point.northing,
      })
      return [
        parseFloat(convertedPoint.lon.toFixed(6)),
        parseFloat(convertedPoint.lat.toFixed(6)),
      ]
    })
    return llPoints
  } else return undefined
}

const BaseLine = (props) => {
  const { setState, locationType } = props

  const inputs = {
    usng: LineMgrs,
    dd: LineLatLon,
    dms: LineDms,
    utmups: LineUtmUps,
  }

  const Component = inputs[locationType] || null

  return (
    <div>
      <Radio
        value={locationType}
        onChange={(value) => setState({ ['locationType']: value })}
      >
        <RadioItem value="dd">Lat/Lon (DD)</RadioItem>
        <RadioItem value="dms">Lat/Lon (DMS)</RadioItem>
        <RadioItem value="usng">USNG / MGRS</RadioItem>
        <RadioItem value="utmups">UTM / UPS</RadioItem>
      </Radio>
      <MinimumSpacing />
      {Component !== null ? <Component {...props} /> : null}
    </div>
  )
}

module.exports = BaseLine
