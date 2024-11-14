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
import Button from '@mui/material/Button'
import CloseIcon from '@mui/icons-material/Close'
import {
  validateUsngLineOrPoly,
  validateDmsLineOrPoly,
  validateUtmUpsLineOrPoly,
} from './validators'
import DmsTextField from './dms-textfield'
import UtmupsTextField from './utmups-textfield'
import { Units } from './common'
import TextField from '../text-field'
import { Radio, RadioItem } from '../radio/radio'
import { MinimumSpacing } from './common'
import _ from 'underscore'

const coordinatePairRegex = /-?\d{1,3}(\.\d*)?\s-?\d{1,3}(\.\d*)?/g

function buildWktString(coordinates: any) {
  return '[[' + coordinates.join('],[') + ']]'
}

function convertWktString(value: any) {
  if (value.includes('MULTI')) {
    return convertMultiWkt(value.includes('POLYGON'), value)
  } else if (value.includes('POLYGON') && value.endsWith('))')) {
    return convertWkt(value, 4)
  } else if (value.includes('LINESTRING') && value.endsWith(')')) {
    return convertWkt(value, 2)
  }
  return value
}

function convertWkt(value: any, numCoords: any) {
  const coordinatePairs = value.match(coordinatePairRegex)
  if (!coordinatePairs || coordinatePairs.length < numCoords) {
    return value
  }
  const coordinates = coordinatePairs.map((coord: any) =>
    coord.replace(' ', ',')
  )
  return buildWktString(coordinates)
}

function convertMultiWkt(isPolygon: any, value: any) {
  if (isPolygon && !value.endsWith(')))')) {
    return value
  } else if (!value.endsWith('))')) {
    return value
  }
  const splitter = isPolygon ? '))' : ')'
  const numPoints = isPolygon ? 4 : 2
  let shapes = value
    .split(splitter)
    .map((shape: any) => shape.match(coordinatePairRegex))
  shapes = shapes
    .filter((shape: any) => shape !== null && shape.length >= numPoints)
    .map((shape: any) =>
      shape.map((coordinatePair: any) => coordinatePair.replace(' ', ','))
    )
  return shapes.length === 0
    ? value
    : shapes.length === 1
    ? buildWktString(shapes[0])
    : '[' + shapes.map((shapeCoords: any) => buildWktString(shapeCoords)) + ']'
}

function getPolygonValue(currentValue: any, value: any) {
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

const clearValidationResults = (errorListener?: any) => {
  errorListener &&
    errorListener({
      line: undefined,
      buffer: undefined,
    })
}

const LineLatLon = (props: any) => {
  const {
    label,
    geometryKey,
    setState,
    setBufferState,
    unitKey,
    widthKey,
    mode,
    polyType,
    errorListener,
  } = props
  const [currentValue, setCurrentValue] = useState(
    JSON.stringify(props[geometryKey])
  )
  const [baseLineError, setBaseLineError] = useState(initialErrorState)
  const [bufferError, setBufferError] = useState(initialErrorState)

  useEffect(() => {
    const { geometryKey } = props
    const newValue =
      typeof props[geometryKey] === 'string'
        ? props[geometryKey]
        : JSON.stringify(props[geometryKey])
    setCurrentValue(newValue)
    if (props.drawing) {
      setBaseLineError(initialErrorState)
      setBufferError(initialErrorState)
    } else {
      const lineValidationResult = validateGeo(mode || polyType, newValue)
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setBaseLineError(lineValidationResult || initialErrorState)
      const bufferValidationResult = validateGeo(widthKey, {
        value: props[widthKey],
        units: props[unitKey],
      })
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setBufferError(bufferValidationResult || initialErrorState)
      errorListener &&
        errorListener({
          line: lineValidationResult,
          buffer: bufferValidationResult,
        })
    }
    return () => clearValidationResults(errorListener)
  }, [
    props.polygon,
    props.line,
    props.lineWidth,
    props.bufferWidth,
    props.polygonBufferWidth,
    props.lineUnits,
    props.polygonBufferUnits,
  ])

  return (
    <div>
      <div className="input-location flex flex-col flex-nowrap space-y-2">
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: any; value: string; onChange: (valu... Remove this comment to see the full error message
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
        />
        <ErrorComponent errorState={baseLineError} />
        <Units
          value={props[unitKey]}
          onChange={(value: any) => {
            typeof setBufferState === 'function'
              ? setBufferState(unitKey, value)
              : setState({ [unitKey]: value })
          }}
        >
          <TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
            type="number"
            label="Buffer width"
            value={String(props[widthKey])}
            onChange={(value) => {
              typeof setBufferState === 'function'
                ? setBufferState(widthKey, value)
                : setState({ [widthKey]: value })
            }}
          />
        </Units>
        <ErrorComponent errorState={bufferError} />
      </div>
    </div>
  )
}

const LineDms = (props: any) => {
  const {
    geometryKey,
    dmsPointArray,
    setState,
    unitKey,
    setBufferState,
    widthKey,
    errorListener,
  } = props
  const [baseLineError, setBaseLineError] = useState(initialErrorState)
  const [bufferError, setBufferError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setBaseLineError(initialErrorState)
      setBufferError(initialErrorState)
    } else {
      const lineValidationResult = validateDmsLineOrPoly(
        dmsPointArray,
        geometryKey
      )
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setBaseLineError(lineValidationResult || initialErrorState)
      const bufferValidationResult = validateGeo(widthKey, {
        value: props[widthKey],
        units: props[unitKey],
      })
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setBufferError(bufferValidationResult || initialErrorState)
      errorListener &&
        errorListener({
          line: lineValidationResult,
          buffer: bufferValidationResult,
        })
    }
    return () => clearValidationResults(errorListener)
  }, [
    props.polygon,
    props.line,
    dmsPointArray,
    props.lineWidth,
    props.bufferWidth,
    props.polygonBufferWidth,
    props.lineUnits,
    props.polygonBufferUnits,
  ])

  return (
    <div>
      <div className="input-location flex flex-col flex-nowrap space-y-2">
        {dmsPointArray &&
          dmsPointArray.map((point: any, index: any) => {
            return (
              <div key={'point-' + index}>
                <DmsTextField
                  point={point}
                  setPoint={(point) => {
                    let array = [...dmsPointArray]
                    array.splice(index, 1, point)
                    setState({ ['dmsPointArray']: array })
                  }}
                  deletePoint={() => {
                    let array = [...dmsPointArray]
                    array.splice(index, 1)
                    setState({ ['dmsPointArray']: array })
                  }}
                />
                <MinimumSpacing />
              </div>
            )
          })}
      </div>
      <Button
        fullWidth
        onClick={() => {
          let array = dmsPointArray ? [...dmsPointArray] : []
          array.push({
            lat: '',
            lon: '',
            latDirection: 'N',
            lonDirection: 'E',
          })
          setState({ ['dmsPointArray']: array })
        }}
      >
        Add Point
      </Button>
      <ErrorComponent errorState={baseLineError} />
      <Units
        value={props[unitKey]}
        onChange={(value: any) => {
          typeof setBufferState === 'function'
            ? setBufferState(unitKey, value)
            : setState({ [unitKey]: value })
        }}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
          type="number"
          label="Buffer width"
          value={String(props[widthKey])}
          onChange={(value) => {
            typeof setBufferState === 'function'
              ? setBufferState(widthKey, value)
              : setState({ [widthKey]: value })
          }}
        />
      </Units>
      <ErrorComponent errorState={bufferError} />
    </div>
  )
}

const LineMgrs = (props: any) => {
  const {
    geometryKey,
    usngPointArray,
    setState,
    unitKey,
    setBufferState,
    widthKey,
    errorListener,
  } = props
  const [baseLineError, setBaseLineError] = useState(initialErrorState)
  const [bufferError, setBufferError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setBaseLineError(initialErrorState)
      setBufferError(initialErrorState)
    } else {
      const lineValidationResult = validateUsngLineOrPoly(
        usngPointArray,
        geometryKey
      )
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setBaseLineError(lineValidationResult || initialErrorState)
      const bufferValidationResult = validateGeo(widthKey, {
        value: props[widthKey],
        units: props[unitKey],
      })
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setBufferError(bufferValidationResult || initialErrorState)
      errorListener &&
        errorListener({
          line: lineValidationResult,
          buffer: bufferValidationResult,
        })
    }
    return () => clearValidationResults(errorListener)
  }, [
    props.polygon,
    props.line,
    usngPointArray,
    props.lineWidth,
    props.bufferWidth,
    props.polygonBufferWidth,
    props.lineUnits,
    props.polygonBufferUnits,
  ])

  return (
    <div>
      <div className="input-location flex flex-col flex-nowrap space-y-2">
        {usngPointArray &&
          usngPointArray.map((coord: any, index: any) => {
            return (
              <TextField
                key={'grid-' + index}
                // @ts-expect-error ts-migrate(2322) FIXME: Type '{ key: string; label: string; value: any; on... Remove this comment to see the full error message
                label="Grid"
                value={coord}
                onChange={(value) => {
                  let points = [...usngPointArray]
                  points.splice(index, 1, value)
                  setState({ ['usngPointArray']: points })
                }}
                addon={
                  <Button
                    onClick={() => {
                      let points = [...usngPointArray]
                      points.splice(index, 1)
                      setState({ ['usngPointArray']: points })
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
          onClick={() => {
            let points = usngPointArray ? [...usngPointArray] : []
            points.push('')
            setState({ ['usngPointArray']: points })
          }}
        >
          Add Point
        </Button>
        <ErrorComponent errorState={baseLineError} />
        <Units
          value={props[unitKey]}
          onChange={(value: any) => {
            typeof setBufferState === 'function'
              ? setBufferState(unitKey, value)
              : setState({ [unitKey]: value })
          }}
        >
          <TextField
            // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
            type="number"
            label="Buffer width"
            value={String(props[widthKey])}
            onChange={(value) => {
              typeof setBufferState === 'function'
                ? setBufferState(widthKey, value)
                : setState({ [widthKey]: value })
            }}
          />
        </Units>
        <ErrorComponent errorState={bufferError} />
      </div>
    </div>
  )
}

const LineUtmUps = (props: any) => {
  const {
    geometryKey,
    utmUpsPointArray,
    setState,
    unitKey,
    setBufferState,
    widthKey,
    errorListener,
  } = props
  const [baseLineError, setBaseLineError] = useState(initialErrorState)
  const [bufferError, setBufferError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setBaseLineError(initialErrorState)
      setBufferError(initialErrorState)
    } else {
      const lineValidationResult = validateUtmUpsLineOrPoly(
        utmUpsPointArray,
        geometryKey
      )
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setBaseLineError(lineValidationResult || initialErrorState)
      const bufferValidationResult = validateGeo(widthKey, {
        value: props[widthKey],
        units: props[unitKey],
      })
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setBufferError(bufferValidationResult || initialErrorState)
      errorListener &&
        errorListener({
          line: lineValidationResult,
          buffer: bufferValidationResult,
        })
    }
    return () => clearValidationResults(errorListener)
  }, [
    props.polygon,
    props.line,
    utmUpsPointArray,
    props.lineWidth,
    props.bufferWidth,
    props.polygonBufferWidth,
    props.lineUnits,
    props.polygonBufferUnits,
  ])

  return (
    <div className="flex flex-col flex-nowrap space-y-2">
      {utmUpsPointArray &&
        utmUpsPointArray.map((point: any, index: any) => {
          return (
            <div key={index}>
              <UtmupsTextField
                point={point}
                setPoint={(point) => {
                  let points = [...utmUpsPointArray]
                  points.splice(index, 1, point)
                  setState({ ['utmUpsPointArray']: points })
                }}
                deletePoint={() => {
                  let points = [...utmUpsPointArray]
                  points.splice(index, 1)
                  setState({ ['utmUpsPointArray']: points })
                }}
              />
              <MinimumSpacing />
            </div>
          )
        })}
      <Button
        fullWidth
        onClick={() => {
          let points = utmUpsPointArray ? [...utmUpsPointArray] : []
          points.push({
            easting: '',
            hemisphere: 'Northern',
            northing: '',
            zoneNumber: 0,
          })
          setState({ ['utmUpsPointArray']: points })
        }}
      >
        Add Point
      </Button>
      <ErrorComponent errorState={baseLineError} />
      <Units
        value={props[unitKey]}
        onChange={(value: any) => {
          typeof setBufferState === 'function'
            ? setBufferState(unitKey, value)
            : setState({ [unitKey]: value })
        }}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
          type="number"
          label="Buffer width"
          value={String(props[widthKey])}
          onChange={(value) => {
            typeof setBufferState === 'function'
              ? setBufferState(widthKey, value)
              : setState({ [widthKey]: value })
          }}
        />
      </Units>
      <ErrorComponent errorState={bufferError} />
    </div>
  )
}

const BaseLine = (props: any) => {
  const { setState, locationType } = props

  const inputs = {
    usng: LineMgrs,
    dd: LineLatLon,
    dms: LineDms,
    utmups: LineUtmUps,
  }

  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const Component = inputs[locationType] || null

  return (
    <div>
      <Radio
        value={locationType}
        onChange={(value: any) => setState({ ['locationType']: value })}
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

export default BaseLine
