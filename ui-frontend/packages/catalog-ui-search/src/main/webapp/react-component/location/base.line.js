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
import validateUsngLineOrPoly from './validators'
const { Units } = require('./common')
const TextField = require('../text-field')
const { Radio, RadioItem } = require('../radio')
const { MinimumSpacing } = require('./common')
const _ = require('underscore')

const usngs = require('usng.js')
const converter = new usngs.Converter()
const usngPrecision = 6

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

const BaseLine = (props) => {
  const { setState, locationType } = props

  const inputs = {
    usng: LineMgrs,
    dd: LineLatLon,
  }

  const Component = inputs[locationType] || null

  return (
    <div>
      <Radio
        value={locationType}
        onChange={(value) => setState({ ['locationType']: value })}
      >
        <RadioItem value="dd">Lat/Lon (DD)</RadioItem>
        <RadioItem value="usng">USNG / MGRS</RadioItem>
      </Radio>
      <MinimumSpacing />
      {Component !== null ? <Component {...props} /> : null}
    </div>
  )
}

module.exports = BaseLine
