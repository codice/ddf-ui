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
  validateGeo,
  ErrorComponent,
  initialErrorState,
  initialErrorStateWithDefault,
} from '../utils/validation'
import Group from '../group'
import Label from './label'
import TextField from '../text-field'
import { Radio, RadioItem } from '../radio/radio'
import { Zone, Hemisphere, MinimumSpacing } from './common'
import {
  DmsLatitude,
  DmsLongitude,
} from '../../component/location-new/geo-components/coordinates'
import DirectionInput from '../../component/location-new/geo-components/direction'
import { Direction } from '../../component/location-new/utils/dms-utils'

const BoundingBoxLatLonDd = (props: any) => {
  const { north, east, south, west, setState } = props
  const [ddError, setDdError] = useState(initialErrorStateWithDefault)

  useEffect(() => {
    if (props.drawing) {
      setDdError(initialErrorStateWithDefault)
    } else {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setDdError(validateGeo('bbox', { north, south, west, east }))
    }
  }, [props.east, props.west, props.south, props.north])

  function validateDd(key: any, value: any, type: any) {
    const label = key.includes('east') || key.includes('west') ? 'lon' : 'lat'
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { error, message, defaultValue } = validateGeo(label, value)
    if (type === 'blur' || defaultValue) {
      setDdError({ error, message, defaultValue })
    }
    if (!error && label === 'lat') {
      const opposite = key.includes('north') ? south : north
      setDdError(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        validateGeo('bbox', {
          north: key.includes('north') ? value : opposite,
          south: key.includes('south') ? value : opposite,
          west,
          east,
        })
      )
    } else if (!error && label === 'lon') {
      const opposite = key.includes('west') ? east : west
      setDdError(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        validateGeo('bbox', {
          north,
          south,
          west: key.includes('west') ? value : opposite,
          east: key.includes('east') ? value : opposite,
        })
      )
    }
    setState({ [key]: defaultValue ? defaultValue : value })
  }

  return (
    <div className="input-location flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="West"
        value={west !== undefined ? String(west) : west}
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        onChange={(value) => validateDd('west', value)}
        onBlur={(event: any) => validateDd('west', west, event.type)}
        type="number"
        step="any"
        min={-180}
        max={180}
        addon="°"
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="South"
        value={south !== undefined ? String(south) : south}
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        onChange={(value) => validateDd('south', value)}
        onBlur={(event: any) => validateDd('south', south, event.type)}
        type="number"
        step="any"
        min={-90}
        max={90}
        addon="°"
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="East"
        value={east !== undefined ? String(east) : east}
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        onChange={(value) => validateDd('east', value)}
        onBlur={(event: any) => validateDd('east', east, event.type)}
        type="number"
        step="any"
        min={-180}
        max={180}
        addon="°"
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="North"
        value={north !== undefined ? String(north) : north}
        // @ts-expect-error ts-migrate(2554) FIXME: Expected 3 arguments, but got 2.
        onChange={(value) => validateDd('north', value)}
        onBlur={(event: any) => validateDd('north', north, event.type)}
        type="number"
        step="any"
        min={-90}
        max={90}
        addon="°"
      />
      <ErrorComponent errorState={ddError} />
    </div>
  )
}

const BoundingBoxLatLonDms = (props: any) => {
  const {
    dmsSouth,
    dmsNorth,
    dmsWest,
    dmsEast,
    dmsSouthDirection,
    dmsNorthDirection,
    dmsWestDirection,
    dmsEastDirection,
    setState,
  } = props
  const [dmsError, setDmsError] = useState(initialErrorStateWithDefault)
  const latitudeDirections = [Direction.North, Direction.South]
  const longitudeDirections = [Direction.East, Direction.West]

  useEffect(() => {
    if (props.drawing) {
      setDmsError(initialErrorStateWithDefault)
    } else {
      setDmsError(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        validateGeo('bbox', {
          isDms: true,
          dmsNorthDirection,
          dmsSouthDirection,
          dmsWestDirection,
          dmsEastDirection,
          north: dmsNorth,
          south: dmsSouth,
          west: dmsWest,
          east: dmsEast,
        })
      )
    }
  }, [props.dmsWest, props.dmsSouth, props.dmsEast, props.dmsNorth])

  function validateDms(key: any, value: any, type: any) {
    const label =
      key.includes('East') || key.includes('West') ? 'dmsLon' : 'dmsLat'
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { error, message, defaultValue } = validateGeo(label, value)
    if (type === 'blur' || defaultValue) {
      setDmsError({
        error,
        message,
        defaultValue,
      })
    }
    if (!error && label === 'dmsLat') {
      const opposite = key.includes('North') ? dmsSouth : dmsNorth
      setDmsError(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        validateGeo('bbox', {
          isDms: true,
          dmsNorthDirection,
          dmsSouthDirection,
          dmsWestDirection,
          dmsEastDirection,
          north: key.includes('North') ? value : opposite,
          south: key.includes('South') ? value : opposite,
          west: dmsWest,
          east: dmsEast,
        })
      )
    } else if (!error && label === 'dmsLon') {
      const opposite = key.includes('West') ? dmsEast : dmsWest
      setDmsError(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        validateGeo('bbox', {
          isDms: true,
          dmsNorthDirection,
          dmsSouthDirection,
          dmsWestDirection,
          dmsEastDirection,
          north: dmsNorth,
          south: dmsSouth,
          west: key.includes('West') ? value : opposite,
          east: key.includes('East') ? value : opposite,
        })
      )
    }
    setState({ [key]: defaultValue ? defaultValue : value })
  }

  return (
    <div className="input-location flex flex-col flex-nowrap space-y-2">
      <DmsLongitude
        label="West"
        value={dmsWest}
        onChange={(value: any, type: any) =>
          validateDms('dmsWest', value, type)
        }
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={longitudeDirections}
          value={dmsWestDirection}
          onChange={(value: any) => setState({ ['dmsWestDirection']: value })}
        />
      </DmsLongitude>
      <DmsLatitude
        label="South"
        value={dmsSouth}
        onChange={(value: any, type: any) =>
          validateDms('dmsSouth', value, type)
        }
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={latitudeDirections}
          value={dmsSouthDirection}
          onChange={(value: any) => setState({ ['dmsSouthDirection']: value })}
        />
      </DmsLatitude>
      <DmsLongitude
        label="East"
        value={dmsEast}
        onChange={(value: any, type: any) =>
          validateDms('dmsEast', value, type)
        }
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={longitudeDirections}
          value={dmsEastDirection}
          onChange={(value: any) => setState({ ['dmsEastDirection']: value })}
        />
      </DmsLongitude>
      <DmsLatitude
        label="North"
        value={dmsNorth}
        onChange={(value: any, type: any) =>
          validateDms('dmsNorth', value, type)
        }
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={latitudeDirections}
          value={dmsNorthDirection}
          onChange={(value: any) => setState({ ['dmsNorthDirection']: value })}
        />
      </DmsLatitude>
      <ErrorComponent errorState={dmsError} />
    </div>
  )
}

const BoundingBoxUsngMgrs = (props: any) => {
  const { usngbbUpperLeft, usngbbLowerRight, setState } = props
  const [usngError, setUsngError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setUsngError(initialErrorState)
    } else {
      setUsngError(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        validateGeo('bbox', {
          isUsng: true,
          upperLeft: usngbbUpperLeft,
          lowerRight: usngbbLowerRight,
        })
      )
    }
  }, [props.usngbbUpperLeft, props.usngbbLowerRight])

  function validateUsng(value: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { error, message } = validateGeo('usng', value)
    setUsngError({ error, message })
    if (!error) {
      setUsngError(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        validateGeo('bbox', {
          isUsng: true,
          upperLeft: usngbbUpperLeft,
          lowerRight: usngbbLowerRight,
        })
      )
    }
  }

  return (
    <div className="input-location flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; style: { minWidth: number; ... Remove this comment to see the full error message
        label="Upper Left"
        style={{ minWidth: 200 }}
        value={usngbbUpperLeft}
        onChange={(value) => setState({ ['usngbbUpperLeft']: value })}
        onBlur={() => validateUsng(usngbbUpperLeft)}
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; style: { minWidth: number; ... Remove this comment to see the full error message
        label="Lower Right"
        style={{ minWidth: 200 }}
        value={usngbbLowerRight}
        onChange={(value) => setState({ ['usngbbLowerRight']: value })}
        onBlur={() => validateUsng(usngbbLowerRight)}
      />
      <ErrorComponent errorState={usngError} />
    </div>
  )
}

const BoundingBoxUtmUps = (props: any) => {
  const {
    utmUpsUpperLeftEasting,
    utmUpsUpperLeftNorthing,
    utmUpsUpperLeftZone,
    utmUpsUpperLeftHemisphere,
    utmUpsLowerRightEasting,
    utmUpsLowerRightNorthing,
    utmUpsLowerRightZone,
    utmUpsLowerRightHemisphere,
    setState,
  } = props
  const upperLeft = {
    easting: utmUpsUpperLeftEasting,
    northing: utmUpsUpperLeftNorthing,
    zoneNumber: utmUpsUpperLeftZone,
    hemisphere: utmUpsUpperLeftHemisphere,
  }
  const lowerRight = {
    easting: utmUpsLowerRightEasting,
    northing: utmUpsLowerRightNorthing,
    zoneNumber: utmUpsLowerRightZone,
    hemisphere: utmUpsLowerRightHemisphere,
  }
  const [upperLeftError, setUpperLeftError] = useState(initialErrorState)
  const [lowerRightError, setLowerRightError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setUpperLeftError(initialErrorState)
      setLowerRightError(initialErrorState)
    } else {
      setLowerRightError(
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        validateGeo('bbox', { isUtmUps: true, upperLeft, lowerRight })
      )
    }
  }, [
    props.utmUpsUpperLeftEasting,
    props.utmUpsUpperLeftNorthing,
    props.utmUpsUpperLeftZone,
    props.utmUpsUpperLeftHemisphere,
    props.utmUpsLowerRightEasting,
    props.utmUpsLowerRightNorthing,
    props.utmUpsLowerRightZone,
    props.utmUpsLowerRightHemisphere,
  ])

  function validateUtmUps(field: any, key: any, value: any) {
    if (field === 'upperLeft') {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      upperLeft[key] = value
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setUpperLeftError(validateGeo(key, upperLeft))
      // If lower right was previously located above upper left,
      // perform an update to the error message in case that has changed
      if (lowerRightError.message.includes('must be located above')) {
        setLowerRightError(
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
          validateGeo('bbox', { isUtmUps: true, upperLeft, lowerRight })
        )
      }
    } else {
      // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
      lowerRight[key] = value
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
      const { error, message } = validateGeo(key, lowerRight)
      setLowerRightError({ error, message })
      if (!error) {
        setLowerRightError(
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
          validateGeo('bbox', { isUtmUps: true, upperLeft, lowerRight })
        )
      }
    }
  }

  return (
    <div>
      <div className="input-location mb-2">
        <Group>
          <Label>Upper Left</Label>
          <div className="flex flex-col space-y-2">
            <TextField
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
              label="Easting"
              value={
                utmUpsUpperLeftEasting !== undefined
                  ? String(utmUpsUpperLeftEasting)
                  : utmUpsUpperLeftEasting
              }
              onChange={(value) =>
                setState({ ['utmUpsUpperLeftEasting']: value })
              }
              onBlur={() =>
                validateUtmUps('upperLeft', 'easting', utmUpsUpperLeftEasting)
              }
              addon="m"
            />
            <TextField
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
              label="Northing"
              value={
                utmUpsUpperLeftNorthing !== undefined
                  ? String(utmUpsUpperLeftNorthing)
                  : utmUpsUpperLeftNorthing
              }
              onChange={(value) =>
                setState({ ['utmUpsUpperLeftNorthing']: value })
              }
              onBlur={() =>
                validateUtmUps('upperLeft', 'northing', utmUpsUpperLeftNorthing)
              }
              addon="m"
            />
            <Zone
              value={utmUpsUpperLeftZone}
              onChange={(value: any) => {
                setState({ ['utmUpsUpperLeftZone']: value })
                validateUtmUps('upperLeft', 'zoneNumber', value)
              }}
            />
            <Hemisphere
              value={utmUpsUpperLeftHemisphere}
              onChange={(value: any) => {
                setState({ ['utmUpsUpperLeftHemisphere']: value })
                validateUtmUps('upperLeft', 'hemisphere', value)
              }}
            />
          </div>
        </Group>
        <ErrorComponent errorState={upperLeftError} />
      </div>
      <div className="input-location">
        <Group>
          <Label>Lower Right</Label>
          <div className="flex flex-col space-y-2">
            <TextField
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
              label="Easting"
              value={
                utmUpsLowerRightEasting !== undefined
                  ? String(utmUpsLowerRightEasting)
                  : utmUpsLowerRightEasting
              }
              onChange={(value) =>
                setState({ ['utmUpsLowerRightEasting']: value })
              }
              onBlur={() =>
                validateUtmUps('lowerRight', 'easting', utmUpsLowerRightEasting)
              }
              addon="m"
            />
            <TextField
              // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
              label="Northing"
              value={
                utmUpsLowerRightNorthing !== undefined
                  ? String(utmUpsLowerRightNorthing)
                  : utmUpsLowerRightNorthing
              }
              onChange={(value) =>
                setState({ ['utmUpsLowerRightNorthing']: value })
              }
              onBlur={() =>
                validateUtmUps(
                  'lowerRight',
                  'northing',
                  utmUpsLowerRightNorthing
                )
              }
              addon="m"
            />
            <Zone
              value={utmUpsLowerRightZone}
              onChange={(value: any) => {
                setState({ ['utmUpsLowerRightZone']: value })
                validateUtmUps('lowerRight', 'zoneNumber', value)
              }}
            />
            <Hemisphere
              value={utmUpsLowerRightHemisphere}
              onChange={(value: any) => {
                setState({ ['utmUpsLowerRightHemisphere']: value })
                validateUtmUps('lowerRight', 'hemisphere', value)
              }}
            />
          </div>
        </Group>
        <ErrorComponent errorState={lowerRightError} />
      </div>
    </div>
  )
}

const BoundingBox = (props: any) => {
  const { setState, locationType } = props

  const inputs = {
    dd: BoundingBoxLatLonDd,
    dms: BoundingBoxLatLonDms,
    usng: BoundingBoxUsngMgrs,
    utmUps: BoundingBoxUtmUps,
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
        <RadioItem value="utmUps">UTM / UPS</RadioItem>
      </Radio>
      <MinimumSpacing />
      {Component !== null ? <Component {...props} /> : null}
    </div>
  )
}

export default BoundingBox
