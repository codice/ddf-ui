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
import { Memo } from '../../../memo/memo'
import { MapViewReact } from '../map.view'
import { OpenlayersDrawings } from './drawing-and-display'
import $ from 'jquery'
import { InteractionsProvider } from '../interactions.provider'
import { LayoutContext } from '../../../golden-layout/visual-settings.provider'
import user from '../../../singletons/user-instance'
import User from '../../../../js/model/User'
import { useBackbone } from '../../../selection-checkbox/useBackbone.hook'
import { OPENLAYERS_MAP_LAYERS } from '../../settings-helpers'

const loadOpenLayersCode = () => {
  // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
  const deferred = new $.Deferred()
  import('./map.openlayers').then((OpenlayersMap) => {
    deferred.resolve(OpenlayersMap.default)
  })
  return deferred
}

export const OpenlayersMapViewReact = ({
  selectionInterface,
  setMap: outerSetMap,
}: {
  selectionInterface: any
  setMap?: (map: any) => void
}) => {
  const [map, setMap] = React.useState<any>(null)
  const [mapLayers, setMapLayers] = React.useState<any>(null)
  const { listenTo } = useBackbone()

  const { getValue, setValue } = React.useContext(LayoutContext)

  React.useEffect(() => {
    const defaultLayers = user.get('user>preferences>mapLayers').toJSON()
    const layerSettings = getValue(OPENLAYERS_MAP_LAYERS, defaultLayers)

    const layerModels = layerSettings.map((layer: any) => {
      return new (User as any).MapLayer(layer, { parse: true })
    })
    const layerCollection = new (User as any).MapLayers(layerModels)
    listenTo(layerCollection, 'add remove', () =>
      setValue(OPENLAYERS_MAP_LAYERS, layerCollection.toJSON())
    )
    layerCollection.validate()
    setMapLayers(layerCollection)
  }, [])

  React.useEffect(() => {
    const callback = () => {
      setValue(OPENLAYERS_MAP_LAYERS, mapLayers.toJSON())
    }
    if (mapLayers) {
      listenTo(mapLayers, 'change', callback)
    }
  }, [mapLayers])

  React.useEffect(() => {
    if (outerSetMap) {
      outerSetMap(map)
    }
  }, [map])

  if (!mapLayers) {
    return null
  }

  return (
    <InteractionsProvider>
      <Memo>
        <MapViewReact
          selectionInterface={selectionInterface}
          mapLayers={mapLayers}
          loadMap={loadOpenLayersCode}
          setMap={setMap}
        />
      </Memo>
      <OpenlayersDrawings map={map} selectionInterface={selectionInterface} />
    </InteractionsProvider>
  )
}
