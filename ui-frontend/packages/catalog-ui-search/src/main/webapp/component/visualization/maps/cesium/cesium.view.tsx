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
import Button from '@mui/material/Button'
import React from 'react'
import { Memo } from '../../../memo/memo'
import { useListenTo } from '../../../selection-checkbox/useBackbone.hook'
import { MapViewReact } from '../map.view'
import { OpenlayersMapViewReact } from '../openlayers/openlayers.view'
import { CesiumDrawings } from './drawing-and-display'

//You typically don't want to use this view directly.  Instead, use the combined-map component which will handle falling back to openlayers.

import $ from 'jquery'
import featureDetection from '../../../singletons/feature-detection'
import { InteractionsProvider } from '../interactions.provider'

const useSupportsCesium = () => {
  const [, setForceRender] = React.useState(Math.random())

  useListenTo(featureDetection, 'change:cesium', () => {
    setForceRender(Math.random())
  })

  return featureDetection.supportsFeature('cesium')
}

const useCountdown = ({
  start,
  length,
}: {
  start: boolean
  length: number
}) => {
  const [finished, setFinished] = React.useState(false)

  React.useEffect(() => {
    if (start && length) {
      const timeoutId = window.setTimeout(() => {
        setFinished(true)
      }, length)
      return () => {
        window.clearTimeout(timeoutId)
      }
    }
    return () => {}
  }, [start, length])
  return finished
}

export const CesiumMapViewReact = ({
  selectionInterface,
  setMap: outerSetMap,
}: {
  setMap?: (map: any) => void // sometimes outer components want to know when the map is loaded
  selectionInterface: any
}) => {
  const supportsCesium = useSupportsCesium()
  const countdownFinished = useCountdown({
    start: !supportsCesium,
    length: 10000,
  })
  const [swap, setSwap] = React.useState(false)
  const [map, setMap] = React.useState<any>(null)
  React.useEffect(() => {
    if (outerSetMap) {
      outerSetMap(map)
    }
  }, [map])
  if (supportsCesium) {
    return (
      <InteractionsProvider>
        <Memo>
          <MapViewReact
            loadMap={() => {
              // @ts-expect-error ts-migrate(7009) FIXME: 'new' expression, whose target lacks a construct s... Remove this comment to see the full error message
              const deferred = new $.Deferred()
              import('./map.cesium').then((CesiumMap) => {
                deferred.resolve(CesiumMap.default)
              })
              return deferred
            }}
            setMap={setMap}
            selectionInterface={selectionInterface}
          />
        </Memo>
        <CesiumDrawings map={map} selectionInterface={selectionInterface} />
      </InteractionsProvider>
    )
  }

  if (countdownFinished || swap) {
    return (
      <OpenlayersMapViewReact
        setMap={setMap}
        selectionInterface={selectionInterface}
      />
    )
  }

  return (
    <>
      <div className="not-supported p-4 flex flex-col items-center space-y-4">
        <h3 className=" text-center">
          The 3D Map is not supported by your browser.
        </h3>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setSwap(true)
          }}
        >
          2D Map
        </Button>
        <h3 className=" text-center">
          2D Map will automatically load after 10 seconds.
        </h3>
      </div>
    </>
  )
}
