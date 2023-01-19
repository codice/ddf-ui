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
import { Radio, RadioItem } from '../radio/radio'
import TextField from '../text-field'
import {
  validateGeo,
  initialErrorState,
  initialErrorStateWithDefault,
  ErrorComponent,
} from '../utils/validation'
import { Units, Zone, Hemisphere, MinimumSpacing } from './common'
import {
  DmsLatitude,
  DmsLongitude,
} from '../../component/location-new/geo-components/coordinates'
import DirectionInput from '../../component/location-new/geo-components/direction'
import { Direction } from '../../component/location-new/utils/dms-utils'

const PointRadiusLatLonDd = (props: any) => {
  const { lat, lon, radius, radiusUnits, setState } = props
  const [ddError, setDdError] = useState(initialErrorStateWithDefault)
  const [radiusError, setRadiusError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setDdError(initialErrorStateWithDefault)
      setRadiusError(initialErrorState)
    }
  }, [props.lat, props.lon, props.radius])

  function validateDd(key: any, value: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { error, message, defaultValue } = validateGeo(key, value)
    if (defaultValue) {
      setDdError({ error, message, defaultValue })
      setState({ [key]: defaultValue })
    } else {
      setState({ [key]: value })
    }
  }

  return (
    <div className="flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
        type="number"
        label="Latitude"
        value={lat !== undefined ? String(lat) : lat}
        onChange={(value) => validateDd('lat', value)}
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        onBlur={() => setDdError(validateGeo('lat', lat))}
        addon="°"
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
        type="number"
        label="Longitude"
        value={lon !== undefined ? String(lon) : lon}
        onChange={(value) => validateDd('lon', value)}
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        onBlur={() => setDdError(validateGeo('lon', lon))}
        addon="°"
      />
      <ErrorComponent errorState={ddError} />
      <Units
        value={radiusUnits}
        onChange={(value: any) => {
          setState({ ['radiusUnits']: value })
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
          setRadiusError(validateGeo('radius', { value: radius, units: value }))
        }}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
          type="number"
          label="Radius"
          value={String(radius)}
          onChange={(value) => {
            setState({ ['radius']: value })
          }}
          onBlur={(e: any) =>
            setRadiusError(
              // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
              validateGeo('radius', {
                value: e.target.value,
                units: radiusUnits,
              })
            )
          }
        />
      </Units>
      <ErrorComponent errorState={radiusError} />
    </div>
  )
}

const PointRadiusLatLonDms = (props: any) => {
  const {
    dmsLat,
    dmsLon,
    dmsLatDirection,
    dmsLonDirection,
    radius,
    radiusUnits,
    setState,
  } = props
  const [dmsError, setDmsError] = useState(initialErrorStateWithDefault)
  const [radiusError, setRadiusError] = useState(initialErrorState)
  const latitudeDirections = [Direction.North, Direction.South]
  const longitudeDirections = [Direction.East, Direction.West]

  useEffect(() => {
    if (props.drawing) {
      setDmsError(initialErrorStateWithDefault)
      setRadiusError(initialErrorState)
    }
  }, [props.dmsLat, props.dmsLon, props.radius])

  function validateDms(key: any, type: any, value: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { error, message, defaultValue } = validateGeo(key, value)
    if (type === 'blur') {
      setDmsError({
        error: value !== undefined && value.length === 0,
        message,
        defaultValue,
      })
    } else if (defaultValue) {
      setDmsError({
        error,
        message,
        defaultValue,
      })
    }
    defaultValue
      ? setState({ [key]: defaultValue })
      : setState({ [key]: value })
  }

  return (
    <div className="flex flex-col flex-nowrap space-y-2">
      <DmsLatitude
        label="Latitude"
        value={dmsLat}
        onChange={(value: any, type: any) => validateDms('dmsLat', type, value)}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={latitudeDirections}
          value={dmsLatDirection}
          onChange={(value: any) => setState({ ['dmsLatDirection']: value })}
        />
      </DmsLatitude>
      <DmsLongitude
        label="Longitude"
        value={dmsLon}
        onChange={(value: any, type: any) => validateDms('dmsLon', type, value)}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={longitudeDirections}
          value={dmsLonDirection}
          onChange={(value: any) => setState({ ['dmsLonDirection']: value })}
        />
      </DmsLongitude>
      <ErrorComponent errorState={dmsError} />
      <Units
        value={radiusUnits}
        onChange={(value: any) => {
          setState({ ['radiusUnits']: value })
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
          setRadiusError(validateGeo('radius', { value: radius, units: value }))
        }}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
          label="Radius"
          type="number"
          value={String(radius)}
          onChange={(value) => {
            setState({ ['radius']: value })
          }}
          onBlur={(e: any) =>
            setRadiusError(
              // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
              validateGeo('radius', {
                value: e.target.value,
                units: radiusUnits,
              })
            )
          }
        />
      </Units>
      <ErrorComponent errorState={radiusError} />
    </div>
  )
}

const PointRadiusUsngMgrs = (props: any) => {
  const { usng, radius, radiusUnits, setState } = props
  const [usngError, setUsngError] = useState(initialErrorState)
  const [radiusError, setRadiusError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setUsngError(initialErrorState)
      setRadiusError(initialErrorState)
    }
  }, [props.usng, props.radius])

  return (
    <div className="flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="USNG / MGRS"
        value={usng}
        onChange={(value) => setState({ ['usng']: value })}
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
        onBlur={() => setUsngError(validateGeo('usng', usng))}
      />
      <ErrorComponent errorState={usngError} />
      <Units
        value={radiusUnits}
        onChange={(value: any) => {
          setState({ ['radiusUnits']: value })
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
          setRadiusError(validateGeo('radius', { value: radius, units: value }))
        }}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
          label="Radius"
          type="number"
          value={String(radius)}
          onChange={(value) => {
            setState({ ['radius']: value })
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            setRadiusError(validateGeo('radius', { value, units: radiusUnits }))
          }}
        />
      </Units>
      <ErrorComponent errorState={radiusError} />
    </div>
  )
}

const PointRadiusUtmUps = (props: any) => {
  const {
    utmUpsEasting,
    utmUpsNorthing,
    utmUpsZone,
    utmUpsHemisphere,
    radius,
    radiusUnits,
    setState,
  } = props
  const [utmError, setUtmError] = useState(initialErrorState)
  const [radiusError, setRadiusError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setUtmError(initialErrorState)
      setRadiusError(initialErrorState)
    }
  }, [
    props.utmUpsEasting,
    props.utmUpsNorthing,
    props.utmUpsZone,
    props.utmUpsHemisphere,
    props.radius,
  ])

  return (
    <div className="flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="Easting"
        value={
          utmUpsEasting !== undefined ? String(utmUpsEasting) : utmUpsEasting
        }
        onChange={(value) => setState({ ['utmUpsEasting']: value })}
        onBlur={() =>
          setUtmError(
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            validateGeo('easting', {
              easting: utmUpsEasting,
              northing: utmUpsNorthing,
              zoneNumber: utmUpsZone,
              hemisphere: utmUpsHemisphere,
            })
          )
        }
        addon="m"
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="Northing"
        value={
          utmUpsNorthing !== undefined ? String(utmUpsNorthing) : utmUpsNorthing
        }
        onChange={(value) => setState({ ['utmUpsNorthing']: value })}
        onBlur={() =>
          setUtmError(
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            validateGeo('northing', {
              easting: utmUpsEasting,
              northing: utmUpsNorthing,
              zoneNumber: utmUpsZone,
              hemisphere: utmUpsHemisphere,
            })
          )
        }
        addon="m"
      />
      <Zone
        value={utmUpsZone}
        onChange={(value: any) => setState({ ['utmUpsZone']: value })}
        onBlur={() =>
          setUtmError(
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            validateGeo('zoneNumber', {
              easting: utmUpsEasting,
              northing: utmUpsNorthing,
              zoneNumber: utmUpsZone,
              hemisphere: utmUpsHemisphere,
            })
          )
        }
      />
      <Hemisphere
        value={utmUpsHemisphere}
        onChange={(value: any) => setState({ ['utmUpsHemisphere']: value })}
        onBlur={() =>
          setUtmError(
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
            validateGeo('hemisphere', {
              easting: utmUpsEasting,
              northing: utmUpsNorthing,
              zoneNumber: utmUpsZone,
              hemisphere: utmUpsHemisphere,
            })
          )
        }
      />
      <ErrorComponent errorState={utmError} />
      <Units
        value={radiusUnits}
        onChange={(value: any) => {
          setState({ ['radiusUnits']: value })
          // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
          setRadiusError(validateGeo('radius', { value: radius, units: value }))
        }}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
          label="Radius"
          type="number"
          value={String(radius)}
          onChange={(value) => {
            setState({ ['radius']: value })
          }}
          onBlur={(e: any) =>
            setRadiusError(
              // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
              validateGeo('radius', {
                value: e.target.value,
                units: radiusUnits,
              })
            )
          }
        />
      </Units>
      <ErrorComponent errorState={radiusError} />
    </div>
  )
}

const PointRadius = (props: any) => {
  const { setState, locationType } = props

  const inputs = {
    dd: PointRadiusLatLonDd,
    dms: PointRadiusLatLonDms,
    usng: PointRadiusUsngMgrs,
    utmUps: PointRadiusUtmUps,
  }

  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const Component = inputs[locationType] || null

  return (
    <div>
      <Radio
        value={locationType}
        onChange={(value: any) => setState({ ['locationType']: value })}
      >
        <RadioItem value="dd">Lat / Lon (DD)</RadioItem>
        <RadioItem value="dms">Lat / Lon (DMS)</RadioItem>
        <RadioItem value="usng">USNG / MGRS</RadioItem>
        <RadioItem value="utmUps">UTM / UPS</RadioItem>
      </Radio>
      <MinimumSpacing />
      <div className="input-location">
        {Component !== null ? <Component {...props} /> : null}
      </div>
    </div>
  )
}

export default PointRadius
