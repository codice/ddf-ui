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
import ExtensionPoints from '../../extension-points'
import GazetteerAutoComplete from '../auto-complete/gazetteer-autocomplete'
import Polygon from './polygon'
import MultiPolygon from './multipoly'
import { TextFieldProps } from '@mui/material/TextField'
import defaultFetch from '../utils/fetch'
import { Suggestion, GeoFeature } from './gazetteer'
import useSnack from '../../component/hooks/useSnack'

type Props = {
  setState: any
  fetch?: any
  value?: string
  onError?: (error: any) => void
  suggester?: (input: string) => Promise<Suggestion[]>
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
  variant?: TextFieldProps['variant']
}

const Keyword = (props: Props) => {
  const [value, setValue] = useState(props.value || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fetch = props.fetch || defaultFetch
  const addSnack = useSnack()
  const {
    polygon,
    setBufferState,
    polygonBufferWidth,
    polygonBufferUnits,
    polyType,
  } = props

  const internalSuggester = async (input: string): Promise<Suggestion[]> => {
    const res = await fetch(`./internal/geofeature/suggestions?q=${input}`)
    const json = await res.json()
    return await json.filter(({ id }: Suggestion) => !id.startsWith('LITERAL'))
  }

  const suggester = async (input: string): Promise<Suggestion[]> => {
    let suggestions: Suggestion[] = []

    const extensionSuggestions = await ExtensionPoints.suggester(input)

    if (extensionSuggestions) {
      suggestions = suggestions.concat(extensionSuggestions)
    }

    if (props.suggester) {
      const propsSuggestions = await props.suggester(input)
      suggestions = suggestions.concat(propsSuggestions)
    } else {
      const internalSuggestions = await internalSuggester(input)
      suggestions = suggestions.concat(internalSuggestions)
    }

    return suggestions
  }

  const internalGeofeature = async ({
    id,
  }: Suggestion): Promise<GeoFeature> => {
    const res = await fetch(`./internal/geofeature?id=${id}`)
    return await res.json()
  }

  const geofeature = async (suggestion: Suggestion): Promise<GeoFeature> => {
    if (suggestion.extensionGeo) {
      return suggestion.extensionGeo
    } else if (props.geofeature) {
      return await props.geofeature(suggestion)
    } else {
      return await internalGeofeature(suggestion)
    }
  }

  const onChange = async (suggestion: Suggestion) => {
    if (!suggestion) {
      props.setState({ hasKeyword: false, value: '', polygon: [] })
      setValue('')
      return
    }

    setError('')
    setValue(suggestion.name)
    setLoading(true)
    try {
      const { type, geometry } = await geofeature(suggestion)
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
          addSnack(
            'Invalid feature - Unrecognized feature type: ' +
              JSON.stringify(type),
            {
              alertProps: {
                severity: 'error',
              },
            }
          )
        }
      }
    } catch (e) {
      console.error(e)
      setLoading(false)
      setError(props.errorMessage || 'Geo feature endpoint unavailable')
      props.onError && props.onError(e)
    }
  }

  return (
    <>
      <GazetteerAutoComplete
        value={value}
        onChange={onChange}
        minimumInputLength={props.minimumInputLength || 1}
        placeholder={props.placeholder || 'Enter a location'}
        suggester={suggester}
        variant={props.variant}
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
    </>
  )
}

export default Keyword
