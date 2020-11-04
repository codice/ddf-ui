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
const React = require('react')
import Keyword from './keyword'
const LocationOldModel = require('../../component/location-old/location-old')
const CustomElements = require('../../js/CustomElements.js')
const wreqr = require('../../js/wreqr.js')
import { Drawing } from '../../component/singletons/drawing'
const ShapeUtils = require('../../js/ShapeUtils.js')
import { useBackbone } from '../../component/selection-checkbox/useBackbone.hook'
import {hot} from 'react-hot-loader'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

const Line = require('./line')
const Polygon = require('./polygon')
const PointRadius = require('./point-radius')
const BoundingBox = require('./bounding-box')
const plugin = require('plugins/location')

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
    Component: ({ setState, keywordValue, ...props }:any) => {
      return (
        <Keyword
          {...props}
          value={keywordValue}
          setState={({ value, ...data }:any) => {
            setState({ keywordValue: value, ...data })
          }}
          setBufferState={(key:any, value:any) => setState({ [key]: value })}
        />
      )
    },
  },
  searcharea: {
    label: 'Search Area',
    // @ts-ignore
    Component: ({setState} : any) => {
      // so here, we basically stuff whatever we want from search areas into the location model upon selection (using setState, see below where we pass that in)
      // setState({
      //   searchAreaId: '102938120398123' // => this roughly will do locationModel.set({ searchAreaId: '102938120398123'})
      // })
      // I would suggest, to be how I would expect this to work, to only store the id of the search area, then do some loading in the component
      // this will mean the search area is always up to date, and minimizes the surface area of what we touch in location-old
      // you could, if you want, keep the information around and only fetch once each time the component loads (this would allow you to avoid fetching over in filter.structure where we have to turn the search area into cql filters)
      // if you do that, just make sure that it fetchs the latest at least once
      // ACTUALLY, I just realized this might make us look bad if a scheduled search is using a search area since it will only have the cql from the most recent use of the ui,
      // so maybe just load in the search area and assume it will be static.  In that case, you can stuff the remaining search area stuff into location old like so:
      // setState({
      //   searchAreaDetails: {
      //     id: '123123213',
      //     /// whatever else we want
      //   }
      // })
      return <div>Fancy geometry</div>
    }
  }
}) as {
  [key:string]: {
    label: string
    Component: any
  }
}

const drawTypes = ['line', 'poly', 'circle', 'bbox']

/**
 * Let's start tracking how the model is shaped
 */
// type LocationModelType = {
//   mode: 'line' | 'circle' | 'poly' | 'bbox'
// }

function getCurrentValue({locationModel}: any) {
  const modelJSON = locationModel.toJSON()
  let type
  if (modelJSON.polygon !== undefined) {
    type = ShapeUtils.isArray3D(modelJSON.polygon)
      ? 'MULTIPOLYGON'
      : 'POLYGON'
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
  console.log(type)
  return Object.assign(modelJSON, {
    type,
    lineWidth: modelJSON.lineWidth,
    radius: modelJSON.radius,
  })
}

function updateMap({locationModel}: any) {
  const mode = locationModel.get('mode')
    if (mode !== undefined && Drawing.isDrawing() !== true) {
      wreqr.vent.trigger('search:' + mode + 'display', locationModel)
    }
}

const Component = CustomElements.registerReact('location')
const LocationInput = ({onChange, value}: any) => {
  const [locationModel] = React.useState(new LocationOldModel(value) as any)
  const [state, setState] = React.useState(locationModel.toJSON() as any) 
  const {listenTo} = useBackbone()
  React.useEffect(() => {
    /**
     * The first on change call is to set the default value for location 
     */
    onChange(getCurrentValue({locationModel}))
    listenTo(locationModel, 'change', () => {
      setState(locationModel.toJSON())
      updateMap({locationModel})
      onChange(getCurrentValue({locationModel}))
    })
    return () => {
      locationModel.set(locationModel.defaults())
      wreqr.vent.trigger('search:drawend', locationModel)
    }
  }, [])

  const ComponentToRender = inputs[state.mode] ? inputs[state.mode].Component : () => null
  const options = Object.entries(inputs).map(entry => {
    const [key, value] = entry
    return {
      label: value.label,
      value: key
    }
  })
  return (
    <div>
      <Component>
      <Autocomplete
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
          value={options.find(opt => opt.value === state.mode)}
          renderInput={(params) => <TextField {...params} variant="outlined" />}
        />

        <div className="form-group clearfix">
         {/* this part is really weird, we splat state as seperate props, that's why we use destructuring */}
        <ComponentToRender {...state} setState={(args:any) => {
          locationModel.set(args) // always update the locationModel, that's our "source of truth", above we map this back into state by listening to changes
        }} /> 
          {drawTypes.includes(state.mode) ? (
            <Button className="location-draw is-primary" onMouseDown={() => {
              wreqr.vent.trigger(
                'search:draw' + state.mode,
                locationModel
              )
            }}>
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