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
import withListenTo, { WithBackboneProps } from '../backbone-container'
import MapInfoPresentation from './presentation'

import { Format, Attribute } from '.'
import { StartupDataStore } from '../../js/model/Startup/startup'
import { LayoutContext } from '../../component/golden-layout/visual-settings.provider'
import { getUserCoordinateFormat } from '../../component/visualization/settings-helpers'
import user from '../../component/singletons/user-instance'

type Props = {
  map: Backbone.Model
} & WithBackboneProps

const mapPropsToState = (props: Props) => {
  const { map } = props
  return {
    coordinates: {
      lat: map.get('mouseLat'),
      lon: map.get('mouseLon'),
    },
    attributes: getAttributes(map),
  }
}

const getAttributes = (map: Backbone.Model) => {
  if (map.get('targetMetacard') === undefined) {
    return []
  }
  return StartupDataStore.Configuration.getSummaryShow()
    .map((attribute: string) => {
      const value =
        map.get('targetMetacard').plain.metacard.properties[attribute]
      return { name: attribute, value }
    })
    .filter(({ value }: Attribute) => value !== undefined)
}

const MapInfo = (props: Props) => {
  const { getValue, onStateChanged, visualTitle, hasLayoutContext } =
    React.useContext(LayoutContext)
  const [stateProps, setStateProps] = React.useState(mapPropsToState(props))
  const [coordFormat, setCoordFormat] = React.useState('degrees')

  const { listenTo, map } = props
  const coordFormatKey = `${visualTitle}-coordFormat`

  const onChange = () => setStateProps(mapPropsToState(props))

  React.useEffect(() => {
    const userDefaultFormat = getUserCoordinateFormat()
    if (hasLayoutContext) {
      setCoordFormat(getValue(coordFormat, userDefaultFormat))
      onStateChanged(() => {
        const coordFormat = getValue(coordFormatKey, getUserCoordinateFormat())
        setCoordFormat(coordFormat)
      })
    } else {
      setCoordFormat(userDefaultFormat)
      props.listenTo(
        user.get('user').get('preferences'),
        'change:coordinateFormat',
        () => setCoordFormat(getUserCoordinateFormat())
      )
    }

    listenTo(
      map,
      'change:mouseLat change:mouseLon change:targetMetacard',
      onChange
    )
  }, [])

  return <MapInfoPresentation {...stateProps} format={coordFormat as Format} />
}

export default withListenTo(MapInfo)
