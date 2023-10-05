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
import LocationOldModel from '../../component/location-old/location-old'
import wreqr from '../../js/wreqr'
import { Drawing, useIsDrawing } from '../../component/singletons/drawing'
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'
import { hot } from 'react-hot-loader'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Line from './line'
import Polygon from './polygon'
import PointRadius from './point-radius'
import BoundingBox from './bounding-box'
import Gazetteer from './gazetteer'
import ShapeUtils from '../../js/ShapeUtils'
import ExtensionPoints from '../../extension-points/extension-points'
import { useTheme } from '@mui/material/styles'
import { Popover } from '@mui/material'
import { ColorSquare, LocationColorSelector } from './location-color-selector'
import { useMenuState } from '../../component/menu-state/menu-state'
import { useMetacardDefinitions } from '../../js/model/Startup/metacard-definitions.hooks'

type InputType = {
  label: string
  Component: any
}
export type InputsType = {
  [key: string]: InputType
}

const BaseInputs = {
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
        // Offsets className="form-group flow-root" below
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
} as InputsType

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
    ;(wreqr as any).vent.trigger('search:' + mode + 'display', locationModel)
  }
}
export const LocationContext = React.createContext({
  filterInputPredicate: (_name: string): boolean => {
    return true
  },
})
const LocationInput = ({ onChange, value, errorListener }: any) => {
  const MetacardDefinitions = useMetacardDefinitions()
  const inputs = React.useMemo(() => {
    return ExtensionPoints.locationTypes(BaseInputs)
  }, [ExtensionPoints.locationTypes])
  const locationContext = React.useContext(LocationContext)
  const [locationModel] = React.useState(new LocationOldModel(value) as any)
  const [state, setState] = React.useState(locationModel.toJSON() as any)
  const isDrawing = useIsDrawing()
  const { listenTo, stopListening } = useBackbone()
  const { MuiButtonProps, MuiPopoverProps } = useMenuState()
  const setColor = (color: string) => {
    locationModel.set('color', color)
    ;(wreqr as any).vent.trigger('search:drawend', [locationModel])
  }
  listenTo((wreqr as any).vent, 'location:doubleClick', (locationId: any) => {
    if (locationModel.attributes.locationId === locationId) {
      ;(wreqr as any).vent.trigger('search:draw' + state.mode, locationModel)
    }
  })
  React.useEffect(() => {
    return () => {
      setTimeout(() => {
        // This is to facilitate clearing out the map, it isn't about the value, but we don't want the changeCallback to fire!
        locationModel.set(locationModel.defaults())
        ;(wreqr as any).vent.trigger('search:drawend', [locationModel])
      }, 0)
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
      <div>
        <Autocomplete
          className="mb-2"
          data-id="filter-type-autocomplete"
          fullWidth
          size="small"
          options={options}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => {
            return option.value === value.value
          }}
          onChange={(_e, newValue) => {
            locationModel.set('mode', newValue.value)
          }}
          disableClearable
          value={
            options.find((opt) => opt.value === state.mode) || {
              value: '',
              label: '',
            }
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder={
                'Select ' + MetacardDefinitions.getAlias('location') + ' Option'
              }
            />
          )}
        />

        <div className="form-group flow-root">
          {/* this part is really weird, we splat state as seperate props, that's why we use destructuring */}
          <ComponentToRender
            {...state}
            setState={(args: any) => {
              locationModel.set(args) // always update the locationModel, that's our "source of truth", above we map this back into state by listening to changes
            }}
            errorListener={errorListener}
          />
          {drawTypes.includes(state.mode) ? (
            <div>
              <div className="flex my-1.5 ml-2 align-middle">
                <div className="align-middle my-auto pr-16 mr-1">Color</div>
                <ColorSquare
                  disabled={isDrawing}
                  color={state.color}
                  {...MuiButtonProps}
                  {...useTheme()}
                  size={'1.8rem'}
                />
                <Popover {...MuiPopoverProps}>
                  <LocationColorSelector setColor={setColor} />
                </Popover>
              </div>
              {isDrawing && locationModel === Drawing.getDrawModel() ? (
                <Button
                  className="location-draw mt-2"
                  onClick={() => {
                    ;(wreqr as any).vent.trigger(
                      'search:drawcancel',
                      locationModel
                    )
                  }}
                  color="secondary"
                  fullWidth
                >
                  <span className="ml-2">Cancel Drawing</span>
                </Button>
              ) : (
                <Button
                  className="location-draw mt-2"
                  onClick={() => {
                    ;(wreqr as any).vent.trigger(
                      'search:draw' + state.mode,
                      locationModel
                    )
                  }}
                  color="primary"
                  fullWidth
                >
                  <span className="fa fa-globe" />
                  <span className="ml-2">Draw</span>
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
export default hot(module)(LocationInput)
