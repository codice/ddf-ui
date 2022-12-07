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

import Group from '../../../react-component/group/index'
import { Radio, RadioItem } from '../../../react-component/radio/radio'
import TextField from '../../../react-component/text-field/index'
import { Units } from '../../../react-component/location/common'
import ListEditor from '../inputs/list-editor'
import { DdLatitude, DdLongitude } from './coordinates'
import { ddPoint } from '../models'
import DistanceUtils from '../../../js/DistanceUtils'

const Point = (props: any) => {
  const { dd, setState } = props
  return (
    <Group>
      <DdLatitude
        value={DistanceUtils.coordinateRound(dd.point.latitude)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.point.latitude = DistanceUtils.coordinateRound(value))
        )}
      />
      <DdLongitude
        value={DistanceUtils.coordinateRound(dd.point.longitude)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.point.longitude = DistanceUtils.coordinateRound(value))
        )}
      />
    </Group>
  )
}

const Circle = (props: any) => {
  const { dd, setState } = props
  return (
    <div className="flex flex-col flex-no-wrap space-y-2">
      <Group>
        <DdLatitude
          value={DistanceUtils.coordinateRound(dd.circle.point.latitude)}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dd.circle.point.latitude = DistanceUtils.coordinateRound(
                value
              ))
          )}
        />
        <DdLongitude
          value={DistanceUtils.coordinateRound(dd.circle.point.longitude)}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dd.circle.point.longitude = DistanceUtils.coordinateRound(
                value
              ))
          )}
        />
      </Group>
      <Units
        value={dd.circle.units}
        onChange={setState(
          (draft: any, value: any) => (draft.dd.circle.units = value)
        )}
      >
        <TextField
          label="Radius"
          type="number"
          // @ts-expect-error ts-migrate(2322) FIXME: Type 'number' is not assignable to type 'string | ... Remove this comment to see the full error message
          value={DistanceUtils.coordinateRound(dd.circle.radius)}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dd.circle.radius = DistanceUtils.coordinateRound(value))
          )}
        />
      </Units>
    </div>
  )
}

const Line = (props: any) => {
  const { dd, setState } = props
  // @ts-expect-error ts-migrate(6133) FIXME: 'entry' is declared but its value is never read.
  const points = dd.line.list.map((entry: any, index: any) => (
    <Group key={index}>
      <DdLatitude
        value={DistanceUtils.coordinateRound(dd.line.list[index].latitude)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.line.list[index].latitude = DistanceUtils.coordinateRound(
              value
            ))
        )}
      />
      <DdLongitude
        value={DistanceUtils.coordinateRound(dd.line.list[index].longitude)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.line.list[
              index
            ].longitude = DistanceUtils.coordinateRound(value))
        )}
      />
    </Group>
  ))

  return (
    <ListEditor
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      list={dd.line.list}
      defaultItem={ddPoint}
      onChange={setState(
        (draft: any, value: any) => (draft.dd.line.list = value)
      )}
    >
      {points}
    </ListEditor>
  )
}

const Polygon = (props: any) => {
  const { dd, setState } = props
  // @ts-expect-error ts-migrate(6133) FIXME: 'entry' is declared but its value is never read.
  const points = dd.polygon.list.map((entry: any, index: any) => (
    <Group key={index}>
      <DdLatitude
        value={DistanceUtils.coordinateRound(dd.polygon.list[index].latitude)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.polygon.list[
              index
            ].latitude = DistanceUtils.coordinateRound(value))
        )}
      />
      <DdLongitude
        value={DistanceUtils.coordinateRound(dd.polygon.list[index].longitude)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.polygon.list[
              index
            ].longitude = DistanceUtils.coordinateRound(value))
        )}
      />
    </Group>
  ))

  return (
    <ListEditor
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      list={dd.polygon.list}
      defaultItem={ddPoint}
      onChange={setState(
        (draft: any, value: any) => (draft.dd.polygon.list = value)
      )}
    >
      {points}
    </ListEditor>
  )
}

const BoundingBox = (props: any) => {
  const { dd, setState } = props
  return (
    <div className="flex flex-col space-y-2">
      <DdLatitude
        label="South"
        value={DistanceUtils.coordinateRound(dd.boundingbox.south)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.boundingbox.south = DistanceUtils.coordinateRound(value))
        )}
      />
      <DdLatitude
        label="North"
        value={DistanceUtils.coordinateRound(dd.boundingbox.north)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.boundingbox.north = DistanceUtils.coordinateRound(value))
        )}
      />
      <DdLongitude
        label="West"
        value={DistanceUtils.coordinateRound(dd.boundingbox.west)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.boundingbox.west = DistanceUtils.coordinateRound(value))
        )}
      />
      <DdLongitude
        label="East"
        value={DistanceUtils.coordinateRound(dd.boundingbox.east)}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dd.boundingbox.east = DistanceUtils.coordinateRound(value))
        )}
      />
    </div>
  )
}

const LatLongDD = (props: any) => {
  const { dd, setState } = props

  const inputs = {
    point: Point,
    line: Line,
    circle: Circle,
    polygon: Polygon,
    boundingbox: BoundingBox,
  }

  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const Component = inputs[dd.shape] || null

  return (
    <div>
      <Radio
        value={dd.shape}
        onChange={setState(
          (draft: any, value: any) => (draft.dd.shape = value)
        )}
      >
        <RadioItem value="point">Point</RadioItem>
        <RadioItem value="circle">Circle</RadioItem>
        <RadioItem value="line">Line</RadioItem>
        <RadioItem value="polygon">Polygon</RadioItem>
        <RadioItem value="boundingbox">Bounding Box</RadioItem>
      </Radio>
      <div className="input-location mt-2">
        {Component !== null ? <Component {...props} /> : null}
      </div>
    </div>
  )
}

export default LatLongDD
