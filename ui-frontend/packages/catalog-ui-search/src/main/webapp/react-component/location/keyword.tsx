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
import * as React from 'react'
import { useState } from 'react'
const Announcement = require('../../component/announcement/index.jsx')

const AutoComplete = require('../auto-complete')
const Polygon = require('./polygon')
const MultiPolygon = require('./multipoly')

import defaultFetch from '../utils/fetch'
import { Suggestion, GeoFeature } from './gazetteer'

type Props = {
  setState: any
  fetch?: any
  value?: string
  onError?: (error: any) => void
  suggester?: (input: string) => Promise<Suggestion>
  geofeature?: (suggestion: Suggestion) => Promise<GeoFeature>
  errorMessage?: string
  polygon?: any[]
  polyType?: string
  setBufferState?: any
  polygonBufferWidth?: string
  polygonBufferUnits?: string
  loadingMessage?: string
  minimumInputLength?: number
  placeholder?: string
}

const Keyword = (props: Props) => {
  const [value, setValue] = useState(props.value || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fetch = props.fetch || defaultFetch

  const {
    polygon,
    setBufferState,
    polygonBufferWidth,
    polygonBufferUnits,
    polyType,
  } = props

  const suggester = async (input: string) => {
    const res = await fetch(`./internal/geofeature/suggestions?q=${input}`)
    const json = await res.json()
    return await json.filter(({ id }: Suggestion) => !id.startsWith('LITERAL'))
  }

  const geofeature = async ({ id }: Suggestion) => {
    const res = await fetch(`./internal/geofeature?id=${id}`)
    return await res.json()
  }

  const onChange = async (suggestion: Suggestion) => {
    const geofeatureFunc =
      props.geofeature || (suggestItem => geofeature(suggestItem))
    setValue(suggestion.name)
    setLoading(true)
    try {
      const { type, geometry = {} } = await geofeatureFunc(suggestion)
      setLoading(false)

      switch (geometry.type) {
        case 'Polygon': {
          const polygon = geometry.coordinates[0]
          props.setState({
            hasKeyword: true,
            locationType: 'latlon',
            polygon,
            polyType: 'polygon',
            value: suggestion.name,
          })
          break
        }
        case 'MultiPolygon': {
          // outer ring only
          const polygon = geometry.coordinates.map((ring: any[]) => ring[0])

          props.setState({
            hasKeyword: true,
            locationType: 'latlon',
            polygon,
            polyType: 'multipolygon',
            value: suggestion.name,
          })
          break
        }
        default: {
          Announcement.announce({
            title: 'Invalid feature',
            message: 'Unrecognized feature type: ' + JSON.stringify(type),
            type: 'error',
          })
        }
      }
    } catch (e) {
      setLoading(false)
      setError(props.errorMessage || 'Geo feature endpoint unavailable')
      props.onError && props.onError(e)
    }
  }

  return (
    <div>
      <AutoComplete
        value={value}
        onChange={onChange}
        minimumInputLength={props.minimumInputLength || 2}
        placeholder={
          props.placeholder || 'Pan to a city, country, or coordinate'
        }
        suggester={props.suggester || suggester}
      />
      {loading && (
        <div style={{ marginTop: 10 }}>
          {props.loadingMessage || 'Loading geometry...'}{' '}
          <span className="fa fa-refresh fa-spin" />
        </div>
      )}
      {error && <div>{error}</div>}
      {polyType === 'polygon' && (
        <Polygon
          polygon={polygon}
          setState={props.setState}
          polygonBufferWidth={polygonBufferWidth}
          polygonBufferUnits={polygonBufferUnits}
          setBufferState={setBufferState}
          polyType={polyType}
        />
      )}
      {polyType === 'multipolygon' && (
        <MultiPolygon
          polygon={polygon}
          setState={props.setState}
          polygonBufferWidth={polygonBufferWidth}
          polygonBufferUnits={polygonBufferUnits}
          setBufferState={setBufferState}
          polyType={polyType}
        />
      )}
    </div>
  )
}

export default Keyword
