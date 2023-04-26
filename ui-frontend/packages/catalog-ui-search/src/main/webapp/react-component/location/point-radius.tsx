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
  const { lat, lon, radius, radiusUnits, setState, errorListener } = props
  const [ddError, setDdError] = useState(initialErrorStateWithDefault)
  const [radiusError, setRadiusError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setDdError(initialErrorStateWithDefault)
      setRadiusError(initialErrorState)
    } else {
      const ddValidationResult = [
        validateGeo('lat', lat),
        validateGeo('lon', lon),
      ].find((validation) => validation?.error)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
      setDdError(ddValidationResult || initialErrorStateWithDefault)
      const radiusValidationResult = validateGeo('radius', {
        value: radius,
        units: radiusUnits,
      })
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setRadiusError(radiusValidationResult || initialErrorState)
      errorListener &&
        errorListener([ddValidationResult, radiusValidationResult])
    }
  }, [props.lat, props.lon, props.radius, props.radiusUnits])

  function validateDd(key: any, value: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { error, message, defaultValue } = validateGeo(key, value)
    setState({ [key]: defaultValue || value })
  }

  return (
    <div className="flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
        type="number"
        label="Latitude"
        value={lat !== undefined ? String(lat) : lat}
        onChange={(value) => validateDd('lat', value)}
        addon="°"
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: any; o... Remove this comment to see the full error message
        type="number"
        label="Longitude"
        value={lon !== undefined ? String(lon) : lon}
        onChange={(value) => validateDd('lon', value)}
        addon="°"
      />
      <ErrorComponent errorState={ddError} />
      <Units
        value={radiusUnits}
        onChange={(value: any) => setState({ ['radiusUnits']: value })}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ type: string; label: string; value: string... Remove this comment to see the full error message
          type="number"
          label="Radius"
          value={String(radius)}
          onChange={(value) => setState({ ['radius']: value })}
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
    errorListener,
  } = props
  const [dmsError, setDmsError] = useState(initialErrorStateWithDefault)
  const [radiusError, setRadiusError] = useState(initialErrorState)
  const latitudeDirections = [Direction.North, Direction.South]
  const longitudeDirections = [Direction.East, Direction.West]

  useEffect(() => {
    if (props.drawing) {
      setDmsError(initialErrorStateWithDefault)
      setRadiusError(initialErrorState)
    } else {
      const dmsValidationResult = [
        validateGeo('dmsLat', dmsLat),
        validateGeo('dmsLon', dmsLon),
      ].find((validation) => validation?.error)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
      setDmsError(dmsValidationResult || initialErrorStateWithDefault)
      const radiusValidationResult = validateGeo('radius', {
        value: radius,
        units: radiusUnits,
      })
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setRadiusError(radiusValidationResult || initialErrorState)
      errorListener &&
        errorListener([dmsValidationResult, radiusValidationResult])
    }
  }, [props.dmsLat, props.dmsLon, props.radius, props.radiusUnits])

  function validateDms(key: any, value: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
    const { error, message, defaultValue } = validateGeo(key, value)
    setState({ [key]: defaultValue || value })
  }

  return (
    <div className="flex flex-col flex-nowrap space-y-2">
      <DmsLatitude
        label="Latitude"
        value={dmsLat}
        onChange={(value: any) => validateDms('dmsLat', value)}
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
        onChange={(value: any) => validateDms('dmsLon', value)}
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
        onChange={(value: any) => setState({ ['radiusUnits']: value })}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
          label="Radius"
          type="number"
          value={String(radius)}
          onChange={(value) => setState({ ['radius']: value })}
        />
      </Units>
      <ErrorComponent errorState={radiusError} />
    </div>
  )
}

const PointRadiusUsngMgrs = (props: any) => {
  const { usng, radius, radiusUnits, setState, errorListener } = props
  const [usngError, setUsngError] = useState(initialErrorState)
  const [radiusError, setRadiusError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setUsngError(initialErrorState)
      setRadiusError(initialErrorState)
    } else {
      const usngValidationResult = validateGeo('usng', usng)
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setUsngError(usngValidationResult)
      const radiusValidationResult = validateGeo('radius', {
        value: radius,
        units: radiusUnits,
      })
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setRadiusError(radiusValidationResult || initialErrorState)
      errorListener &&
        errorListener([usngValidationResult, radiusValidationResult])
    }
  }, [props.usng, props.radius, props.radiusUnits])

  return (
    <div className="flex flex-col flex-nowrap space-y-2">
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="USNG / MGRS"
        value={usng}
        onChange={(value) => setState({ ['usng']: value })}
      />
      <ErrorComponent errorState={usngError} />
      <Units
        value={radiusUnits}
        onChange={(value: any) => setState({ ['radiusUnits']: value })}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
          label="Radius"
          type="number"
          value={String(radius)}
          onChange={(value) => setState({ ['radius']: value })}
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
    errorListener,
  } = props
  const [utmError, setUtmError] = useState(initialErrorState)
  const [radiusError, setRadiusError] = useState(initialErrorState)

  useEffect(() => {
    if (props.drawing) {
      setUtmError(initialErrorState)
      setRadiusError(initialErrorState)
    } else {
      const utmUps = {
        easting: utmUpsEasting,
        northing: utmUpsNorthing,
        zoneNumber: utmUpsZone,
        hemisphere: utmUpsHemisphere,
      }
      const utmUpsValidationResult = [
        validateGeo('utmUpsEasting', utmUps),
        validateGeo('utmUpsNorthing', utmUps),
        validateGeo('utmUpsZone', utmUps),
        validateGeo('utmUpsHemisphere', utmUps),
      ].find((validation) => validation?.error)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'error' does not exist on type '{ error: ... Remove this comment to see the full error message
      setUtmError(utmUpsValidationResult || initialErrorStateWithDefault)
      const radiusValidationResult = validateGeo('radius', {
        value: radius,
        units: radiusUnits,
      })
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ error: boolean; message: strin... Remove this comment to see the full error message
      setRadiusError(radiusValidationResult || initialErrorState)
      errorListener &&
        errorListener([utmUpsValidationResult, radiusValidationResult])
    }
  }, [
    props.utmUpsEasting,
    props.utmUpsNorthing,
    props.utmUpsZone,
    props.utmUpsHemisphere,
    props.radius,
    props.radiusUnits,
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
        addon="m"
      />
      <TextField
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; value: any; onChange: (valu... Remove this comment to see the full error message
        label="Northing"
        value={
          utmUpsNorthing !== undefined ? String(utmUpsNorthing) : utmUpsNorthing
        }
        onChange={(value) => setState({ ['utmUpsNorthing']: value })}
        addon="m"
      />
      <Zone
        value={utmUpsZone}
        onChange={(value: any) => setState({ ['utmUpsZone']: value })}
      />
      <Hemisphere
        value={utmUpsHemisphere}
        onChange={(value: any) => setState({ ['utmUpsHemisphere']: value })}
      />
      <ErrorComponent errorState={utmError} />
      <Units
        value={radiusUnits}
        onChange={(value: any) => setState({ ['radiusUnits']: value })}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: string... Remove this comment to see the full error message
          label="Radius"
          type="number"
          value={String(radius)}
          onChange={(value) => setState({ ['radius']: value })}
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
