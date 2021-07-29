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
import LocationComponent, { LocationInputPropsType } from './location'
const { ddToWkt, dmsToWkt, usngToWkt } = require('./utils')

const withAdapter = (Component: any) =>
  class extends React.Component<any, any> {
    constructor(props: any) {
      super(props)
      this.state = props.model.toJSON()
    }
    setModelState() {
      this.setState(this.props.model.toJSON())
    }
    componentWillMount() {
      this.props.model.on('change', this.setModelState, this)
    }
    componentWillUnmount() {
      this.props.model.off('change', this.setModelState)
    }
    render() {
      return (
        <Component
          state={this.state}
          options={this.props.options}
          setState={(...args: any) => this.props.model.set(...args)}
        />
      )
    }
  }

const LocationInput = withAdapter(LocationComponent) as any

const Marionette = require('marionette')
const _ = require('underscore')
const CustomElements = require('../../js/CustomElements.js')
const LocationNewModel = require('./location-new')

type LocationInputReactPropsType = {
  value: string
  onChange: (val: string) => void
}

export const LocationInputReact = ({
  value,
  onChange,
}: LocationInputReactPropsType) => {
  const [state, setState] = React.useState<LocationInputPropsType>(
    new LocationNewModel({ wkt: value, mode: 'wkt' }).toJSON()
  )

  React.useEffect(() => {
    if (state.valid) {
      switch (state.mode) {
        case 'wkt':
          onChange(state.wkt)
          break
        case 'dd':
          onChange(ddToWkt(state.dd))
          break
        case 'dms':
          onChange(dmsToWkt(state.dms))
          break
        case 'usng':
          onChange(usngToWkt(state.usng))
          break
        default:
      }
    } else {
      onChange('INVALID')
    }
  }, [state])

  return <LocationComponent state={state} options={{}} setState={setState} />
}

export default Marionette.LayoutView.extend({
  template() {
    return (
      <div className="location-input">
        <LocationInput model={this.model} />
      </div>
    )
  },
  tagName: CustomElements.register('location-new'),
  initialize() {
    this.propertyModel = this.model
    this.model = new LocationNewModel()
    _.bindAll.apply(_, [this].concat(_.functions(this))) // underscore bindAll does not take array arg
  },
  getCurrentValue() {
    return this.model.getValue()
  },
  isValid() {
    return this.model.isValid()
  },
})
