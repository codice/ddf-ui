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
import { useState, useEffect } from 'react'
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

const clearValidationResults = (errorListener?: any) => {
  errorListener &&
    errorListener({
      bbox: undefined,
      bboxUL: undefined,
      bboxLR: undefined,
    })
}

const BoundingBoxLatLonDd = (props: any) => {
  const { north, east, south, west, setState, errorListener } = props
  const [ddError, setDdError] = useState(initialErrorStateWithDefault)

  useEffect(() => {
    if (props.drawing) {
      setDdError(initialErrorStateWithDefault)
    } else {
      const validationResults = [
        validateGeo('lon', west),
        validateGeo('lon', east),
        validateGeo('lat', north),
        validateGeo('lat', south),
        validateGeo('bbox', { north, south, west, east }),
      ]
      const validationResult = validationResults.find(
        (validation) => validation?.error
      )
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setDdError(validationResult || initialErrorStateWithDefault)
      errorListener && errorListener({ bbox: validationResult })
    }
    return () => clearValidationResults(errorListener)
  }, [props.east, props.west, props.south, props.north])

  function clampDd(key: any, value: any) {
    const coordinateType =
      key.includes('east') || key.includes('west') ? 'lon' : 'lat'
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { defaultValue } = validateGeo(coordinateType, value)
    setState({ [key]: defaultValue || value })
  }

  return (
    <div className="input-location flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="West"
        value={west !== undefined ? String(west) : west}
        onChange={(value) => clampDd('west', value)}
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
        onChange={(value) => clampDd('south', value)}
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
        onChange={(value) => clampDd('east', value)}
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
        onChange={(value) => clampDd('north', value)}
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
    errorListener,
  } = props
  const [dmsError, setDmsError] = useState(initialErrorStateWithDefault)
  const latitudeDirections = [Direction.North, Direction.South]
  const longitudeDirections = [Direction.East, Direction.West]

  useEffect(() => {
    if (props.drawing) {
      setDmsError(initialErrorStateWithDefault)
    } else {
      const validationResults = [
        validateGeo('dmsLon', dmsWest),
        validateGeo('dmsLon', dmsEast),
        validateGeo('dmsLat', dmsNorth),
        validateGeo('dmsLat', dmsSouth),
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
        }),
      ]
      const validationResult = validationResults.find(
        (validation) => validation?.error
      )
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setDmsError(validationResult || initialErrorStateWithDefault)
      errorListener && errorListener({ bbox: validationResult })
    }
    return () => clearValidationResults(errorListener)
  }, [props.dmsWest, props.dmsSouth, props.dmsEast, props.dmsNorth])

  function clampDms(key: any, value: any) {
    const coordinateType =
      key.includes('East') || key.includes('West') ? 'dmsLon' : 'dmsLat'
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { defaultValue } = validateGeo(coordinateType, value)
    setState({ [key]: defaultValue || value })
  }

  return (
    <div className="input-location flex flex-col flex-nowrap space-y-2">
      <DmsLongitude
        label="West"
        value={dmsWest}
        onChange={(value: any) => clampDms('dmsWest', value)}
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
        onChange={(value: any) => clampDms('dmsSouth', value)}
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
        onChange={(value: any) => clampDms('dmsEast', value)}
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
        onChange={(value: any) => clampDms('dmsNorth', value)}
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
  const { usngbbUpperLeft, usngbbLowerRight, setState, errorListener } = props
  const [usngError, setUsngError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setUsngError(initialErrorState)
    } else {
      const validationResult = [
        validateGeo('usng', usngbbUpperLeft),
        validateGeo('usng', usngbbLowerRight),
        validateGeo('bbox', {
          isUsng: true,
          upperLeft: usngbbUpperLeft,
          lowerRight: usngbbLowerRight,
        }),
      ].find((validation) => validation?.error)
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setUsngError(validationResult || initialErrorState)
      errorListener && errorListener({ bbox: validationResult })
    }
    return () => clearValidationResults(errorListener)
  }, [props.usngbbUpperLeft, props.usngbbLowerRight])

  return (
    <div className="input-location flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; style: { minWidth: number; ... Remove this comment to see the full error message
        label="Upper Left"
        style={{ minWidth: 200 }}
        value={usngbbUpperLeft}
        onChange={(value) => setState({ ['usngbbUpperLeft']: value })}
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; style: { minWidth: number; ... Remove this comment to see the full error message
        label="Lower Right"
        style={{ minWidth: 200 }}
        value={usngbbLowerRight}
        onChange={(value) => setState({ ['usngbbLowerRight']: value })}
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
    errorListener,
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
      const upperLeftValidationResult = [
        validateGeo('easting', upperLeft),
        validateGeo('northing', upperLeft),
        validateGeo('zoneNumber', upperLeft),
        validateGeo('hemisphere', upperLeft),
      ].find((validation) => validation?.error)
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setUpperLeftError(upperLeftValidationResult || initialErrorState)
      const lowerRightValidationResult = [
        validateGeo('easting', lowerRight),
        validateGeo('northing', lowerRight),
        validateGeo('zoneNumber', lowerRight),
        validateGeo('hemisphere', lowerRight),
        validateGeo('bbox', { isUtmUps: true, upperLeft, lowerRight }),
      ].find((validation) => validation?.error)
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setLowerRightError(lowerRightValidationResult || initialErrorState)
      errorListener &&
        errorListener({
          bboxUL: upperLeftValidationResult,
          bboxLR: lowerRightValidationResult,
        })
    }
    return () => clearValidationResults(errorListener)
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
              addon="m"
            />
            <Zone
              value={utmUpsUpperLeftZone}
              onChange={(value: any) =>
                setState({ ['utmUpsUpperLeftZone']: value })
              }
            />
            <Hemisphere
              value={utmUpsUpperLeftHemisphere}
              onChange={(value: any) =>
                setState({ ['utmUpsUpperLeftHemisphere']: value })
              }
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
              addon="m"
            />
            <Zone
              value={utmUpsLowerRightZone}
              onChange={(value: any) =>
                setState({ ['utmUpsLowerRightZone']: value })
              }
            />
            <Hemisphere
              value={utmUpsLowerRightHemisphere}
              onChange={(value: any) =>
                setState({ ['utmUpsLowerRightHemisphere']: value })
              }
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
