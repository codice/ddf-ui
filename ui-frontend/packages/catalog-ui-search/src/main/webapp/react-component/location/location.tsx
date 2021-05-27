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
const LocationOldModel = require('../../component/location-old/location-old')
const CustomElements = require('../../js/CustomElements.js')
const wreqr = require('../../js/wreqr.js')
import { Drawing } from '../../component/singletons/drawing'
const ShapeUtils = require('../../js/ShapeUtils.js')
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'
import { hot } from 'react-hot-loader'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

const Line = require('./line')
const Polygon = require('./polygon')
const PointRadius = require('./point-radius')
const BoundingBox = require('./bounding-box')
import Gazetteer from './gazetteer'
const plugin = require('plugins/location')

type InputType = {
  label: string
  Component: any
}
type InputsType = {
  [key: string]: InputType
}
const inputs = plugin({
  line: {
    label: 'Line',
    Component: Line,
  },
  poly: {
    label: 'Polygon',
    Component: Polygon,
  },
  circle: {
    label: 'Point-Radius',
    Component: PointRadius,
  },
  bbox: {
    label: 'Bounding Box',
    Component: BoundingBox,
  },
  keyword: {
    label: 'Keyword',
    Component: ({ setState, keywordValue, ...props }: any) => {
      return (
        // Offsets className="form-group clearfix" below
        <div>
          <Gazetteer
            {...props}
            value={keywordValue}
            setState={({ value, ...data }: any) => {
              setState({ keywordValue: value, ...data })
            }}
            setBufferState={(key: any, value: any) =>
              setState({ [key]: value })
            }
            variant="outlined"
          />
        </div>
      )
    },
  },
}) as InputsType

const drawTypes = ['line', 'poly', 'circle', 'bbox']

function getCurrentValue({ locationModel }: any) {
  const modelJSON = locationModel.toJSON()
  let type
  if (modelJSON.polygon !== undefined) {
    type = ShapeUtils.isArray3D(modelJSON.polygon) ? 'MULTIPOLYGON' : 'POLYGON'
  } else if (
    modelJSON.lat !== undefined &&
    modelJSON.lon !== undefined &&
    modelJSON.radius !== undefined
  ) {
    type = 'POINTRADIUS'
  } else if (
    modelJSON.line !== undefined &&
    modelJSON.lineWidth !== undefined
  ) {
    type = 'LINE'
  } else if (
    modelJSON.north !== undefined &&
    modelJSON.south !== undefined &&
    modelJSON.east !== undefined &&
    modelJSON.west !== undefined
  ) {
    type = 'BBOX'
  }
  return Object.assign(modelJSON, {
    type,
    lineWidth: modelJSON.lineWidth,
    radius: modelJSON.radius,
  })
}

function updateMap({ locationModel }: any) {
  const mode = locationModel.get('mode')
  if (mode !== undefined && Drawing.isDrawing() !== true) {
    wreqr.vent.trigger('search:' + mode + 'display', locationModel)
  }
}

export const LocationContext = React.createContext({
  filterInputPredicate: (_name: string): boolean => {
    return true
  },
})
const Component = CustomElements.registerReact('location')
const LocationInput = ({ onChange, value }: any) => {
  const locationContext = React.useContext(LocationContext)
  const [locationModel] = React.useState(new LocationOldModel(value) as any)
  const [state, setState] = React.useState(locationModel.toJSON() as any)
  const { listenTo, stopListening } = useBackbone()
  React.useEffect(() => {
    return () => {
      // This is to facilitate clearing out the map, it isn't about the value
      locationModel.set(locationModel.defaults())
      wreqr.vent.trigger('search:drawend', locationModel)
    }
  }, [])
  React.useEffect(() => {
    const onChangeCallback = () => {
      setState(locationModel.toJSON())
      updateMap({ locationModel })
      onChange(getCurrentValue({ locationModel }))
    }
    listenTo(locationModel, 'change', onChangeCallback)
    return () => {
      stopListening(locationModel, 'change', onChangeCallback)
    }
  }, [onChange])

  const ComponentToRender = inputs[state.mode]
    ? inputs[state.mode].Component
    : () => null
  const options = Object.entries(inputs)
    .map((entry) => {
      const [key, value] = entry
      return {
        label: value.label,
        value: key,
      }
    })
    .filter((value) => {
      return locationContext.filterInputPredicate(value.value)
    })
  return (
    <div>
      <Component>
        <Autocomplete
          className="mb-2"
          data-id="filter-type-autocomplete"
          // @ts-ignore fullWidth does exist on Autocomplete
          fullWidth
          size="small"
          options={options}
          getOptionLabel={(option) => option.label}
          getOptionSelected={(option, value) => {
            return option.value === value.value
          }}
          onChange={(_e, newValue) => {
            locationModel.set('mode', newValue.value)
          }}
          disableClearable
          value={options.find((opt) => opt.value === state.mode)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Select Location Option"
            />
          )}
        />

        <div className="form-group clearfix">
          {/* this part is really weird, we splat state as seperate props, that's why we use destructuring */}
          <ComponentToRender
            {...state}
            setState={(args: any) => {
              locationModel.set(args) // always update the locationModel, that's our "source of truth", above we map this back into state by listening to changes
            }}
          />
          {drawTypes.includes(state.mode) ? (
            <Button
              className="location-draw is-primary"
              onMouseDown={() => {
                wreqr.vent.trigger('search:draw' + state.mode, locationModel)
              }}
            >
              <span className="fa fa-globe" />
              <span>Draw</span>
            </Button>
          ) : null}
        </div>
      </Component>
    </div>
  )
}

export default hot(module)(LocationInput)
