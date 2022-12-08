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
import React from 'react'
import { validateWkt, validateDd, validateDms, validateUsng } from './utils'
import { Radio, RadioItem } from '../../react-component/radio/radio'
import { WKT, LatLongDD, LatLongDMS, USNG } from './geo-components'
import Gazetteer from '../../react-component/location/gazetteer'
import CQLUtils from '../../js/CQLUtils'
import immer from 'immer'
const produce = immer
import { hot } from 'react-hot-loader'

const inputs = {
  wkt: {
    label: 'WKT',
    Component: WKT,
  },
  dd: {
    label: 'Lat/Lon (DD)',
    Component: LatLongDD,
  },
  dms: {
    label: 'Lat/Lon (DMS)',
    Component: LatLongDMS,
  },
  usng: {
    label: 'USNG/MGRS',
    Component: USNG,
  },
  keyword: {
    label: 'Keyword',
    Component: (props: LocationInputPropsType) => {
      const { keyword } = props
      return (
        <Gazetteer
          placeholder={'Enter a location'}
          value={keyword ? keyword.keywordValue : ''}
          setState={props.setState(
            (draft: LocationInputPropsType, value: any) => {
              value.type =
                value.polyType.toLowerCase() === 'polygon'
                  ? 'POLYGON'
                  : 'MULTIPOLYGON'
              value.keywordValue = value.value
              value.mode = 'keyword'

              value.wkt = CQLUtils.generateFilter(
                undefined,
                'location',
                value,
                undefined
              ).value
              draft.keyword = value
              // onFieldEdit(field.id, location)
            }
          )}
        />
      )
    },
  },
} as {
  [key: string]: {
    label: string
    Component: any
  }
}

const validate = ({
  state,
  setState,
}: {
  state: LocationInputPropsType
  setState: (state: LocationInputPropsType) => void
}) => {
  const mode = state.mode
  let validationReport
  switch (mode) {
    case 'wkt':
      validationReport = validateWkt(state[mode])
      break
    case 'dd':
      validationReport = validateDd(state[mode])
      break
    case 'dms':
      validationReport = validateDms(state[mode])
      break
    case 'usng':
      validationReport = validateUsng(state[mode])
      break
  }
  setState({
    ...state,
    valid: validationReport ? validationReport.valid : true,
    error: validationReport ? validationReport.error : (false as any),
  })
}

export type LocationInputPropsType = {
  dd: {
    boundingBox: {
      north: string
      south: string
      east: string
      west: string
    }
    circle: {
      point: { latitude: string; longitude: string }
      radius: string
      units: 'meters'
    }
    line: {
      list: any[]
    }
    point: { latitude: string; longitude: string }
    polygon: { list: any[] }
    shape: 'point'
  }
  keyword: any
  dms: any
  error: null | string
  mode: 'wkt' | 'dd' | 'dms' | 'usng' | 'keyword'
  setState: any
  showErrors: boolean
  usng: any
  valid: boolean
  wkt: string
}

const LocationInput = (props: LocationInputPropsType) => {
  const { mode, valid, error, showErrors, setState } = props
  const input = inputs[mode] || {}
  const { Component = null } = input

  React.useEffect(() => {
    validate({
      state: props,
      setState: props.setState((draft: any, value: any) => {
        draft.valid = value.valid
        draft.error = value.error
        return draft
      }),
    })
  }, [props])

  return (
    <div className="">
      <Radio
        value={mode}
        onChange={setState((draft: any, value: any) => (draft.mode = value))}
      >
        {Object.keys(inputs).map((key) => (
          <RadioItem key={key} value={key}>
            {inputs[key].label}
          </RadioItem>
        ))}
      </Radio>
      <div className="form-group clearfix mt-2">
        {Component !== null ? <Component {...props} /> : null}
        <div
          className={`for-error whitespace-pre-line ${
            !valid && showErrors ? '' : 'invisible'
          }`}
          style={{
            width: '400px',
            maxWidth: '100%',
          }}
        >
          <span className="fa fa-exclamation-triangle" /> {error}
        </div>
      </div>
    </div>
  )
}

export default hot(module)(({ state, setState }: any) => (
  <LocationInput
    {...state}
    setState={(producer: any) => (value: any) => {
      const nextState = produce(state, (draft: any) => {
        producer(draft, value)
      })
      setState(nextState)
    }}
  />
))
