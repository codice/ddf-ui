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
import React from 'react';

import Group from '../../../react-component/group/index';
import { Radio, RadioItem } from '../../../react-component/radio/radio';
import TextField from '../../../react-component/text-field/index';
import { Units } from '../../../react-component/location/common';
import ListEditor from '../inputs/list-editor';
import { DmsLatitude, DmsLongitude } from './coordinates';
import { dmsPoint } from '../models';
import DirectionInput from './direction';
import { Direction } from '../utils/dms-utils';

const latitudeDirections = [Direction.North, Direction.South]
const longitudeDirections = [Direction.East, Direction.West]

const Point = (props: any) => {
  const { dms, setState } = props
  return (
    <Group>
      <DmsLatitude
        value={dms.point.latitude.coordinate}
        onChange={setState(
          (draft: any, value: any) => (draft.dms.point.latitude.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={latitudeDirections}
          value={dms.point.latitude.direction}
          onChange={setState(
            (draft: any, value: any) => (draft.dms.point.latitude.direction = value)
          )}
        />
      </DmsLatitude>
      <DmsLongitude
        value={dms.point.longitude.coordinate}
        onChange={setState(
          (draft: any, value: any) => (draft.dms.point.longitude.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={longitudeDirections}
          value={dms.point.longitude.direction}
          onChange={setState(
            (draft: any, value: any) => (draft.dms.point.longitude.direction = value)
          )}
        />
      </DmsLongitude>
    </Group>
  );
}

const Circle = (props: any) => {
  const { dms, setState } = props
  return (
    <div className="flex flex-col flex-no-wrap space-y-2">
      <Group>
        <DmsLatitude
          value={dms.circle.point.latitude.coordinate}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dms.circle.point.latitude.coordinate = value)
          )}
        >
          <DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            options={latitudeDirections}
            value={dms.circle.point.latitude.direction}
            onChange={setState(
              (draft: any, value: any) =>
                (draft.dms.circle.point.latitude.direction = value)
            )}
          />
        </DmsLatitude>
        <DmsLongitude
          value={dms.circle.point.longitude.coordinate}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dms.circle.point.longitude.coordinate = value)
          )}
        >
          <DirectionInput
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
            options={longitudeDirections}
            value={dms.circle.point.longitude.direction}
            onChange={setState(
              (draft: any, value: any) =>
                (draft.dms.circle.point.longitude.direction = value)
            )}
          />
        </DmsLongitude>
      </Group>
      <Units
        value={dms.circle.units}
        onChange={setState((draft: any, value: any) => (draft.dms.circle.units = value))}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: any; o... Remove this comment to see the full error message
          label="Radius"
          type="number"
          value={dms.circle.radius}
          onChange={setState(
            (draft: any, value: any) => (draft.dms.circle.radius = value)
          )}
        />
      </Units>
    </div>
  );
}

const Line = (props: any) => {
  const { dms, setState } = props
  // @ts-expect-error ts-migrate(6133) FIXME: 'entry' is declared but its value is never read.
  const points = dms.line.list.map((entry: any, index: any) => (
    <Group key={index}>
      <DmsLatitude
        value={dms.line.list[index].latitude.coordinate}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dms.line.list[index].latitude.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={latitudeDirections}
          value={dms.line.list[index].latitude.direction}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dms.line.list[index].latitude.direction = value)
          )}
        />
      </DmsLatitude>
      <DmsLongitude
        value={dms.line.list[index].longitude.coordinate}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dms.line.list[index].longitude.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={longitudeDirections}
          value={dms.line.list[index].longitude.direction}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dms.line.list[index].longitude.direction = value)
          )}
        />
      </DmsLongitude>
    </Group>
  ))

  return (
    <ListEditor
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      list={dms.line.list}
      defaultItem={dmsPoint}
      onChange={setState((draft: any, value: any) => (draft.dms.line.list = value))}
    >
      {points}
    </ListEditor>
  );
}

const Polygon = (props: any) => {
  const { dms, setState } = props
  // @ts-expect-error ts-migrate(6133) FIXME: 'entry' is declared but its value is never read.
  const points = dms.polygon.list.map((entry: any, index: any) => (
    <Group key={index}>
      <DmsLatitude
        value={dms.polygon.list[index].latitude.coordinate}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dms.polygon.list[index].latitude.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={latitudeDirections}
          value={dms.polygon.list[index].latitude.direction}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dms.polygon.list[index].latitude.direction = value)
          )}
        />
      </DmsLatitude>
      <DmsLongitude
        value={dms.polygon.list[index].longitude.coordinate}
        onChange={setState(
          (draft: any, value: any) =>
            (draft.dms.polygon.list[index].longitude.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={longitudeDirections}
          value={dms.polygon.list[index].longitude.direction}
          onChange={setState(
            (draft: any, value: any) =>
              (draft.dms.polygon.list[index].longitude.direction = value)
          )}
        />
      </DmsLongitude>
    </Group>
  ))

  return (
    <ListEditor
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      list={dms.polygon.list}
      defaultItem={dmsPoint}
      onChange={setState((draft: any, value: any) => (draft.dms.polygon.list = value))}
    >
      {points}
    </ListEditor>
  );
}

const BoundingBox = (props: any) => {
  const { dms, setState } = props
  return (
    <div className="flex flex-col flex-no-wrap space-y-2">
      <DmsLatitude
        label="South"
        value={dms.boundingbox.south.coordinate}
        onChange={setState(
          (draft: any, value: any) => (draft.dms.boundingbox.south.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={latitudeDirections}
          value={dms.boundingbox.south.direction}
          onChange={setState(
            (draft: any, value: any) => (draft.dms.boundingbox.south.direction = value)
          )}
        />
      </DmsLatitude>
      <DmsLatitude
        label="North"
        value={dms.boundingbox.north.coordinate}
        onChange={setState(
          (draft: any, value: any) => (draft.dms.boundingbox.north.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={latitudeDirections}
          value={dms.boundingbox.north.direction}
          onChange={setState(
            (draft: any, value: any) => (draft.dms.boundingbox.north.direction = value)
          )}
        />
      </DmsLatitude>
      <DmsLongitude
        label="West"
        value={dms.boundingbox.west.coordinate}
        onChange={setState(
          (draft: any, value: any) => (draft.dms.boundingbox.west.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={longitudeDirections}
          value={dms.boundingbox.west.direction}
          onChange={setState(
            (draft: any, value: any) => (draft.dms.boundingbox.west.direction = value)
          )}
        />
      </DmsLongitude>
      <DmsLongitude
        label="East"
        value={dms.boundingbox.east.coordinate}
        onChange={setState(
          (draft: any, value: any) => (draft.dms.boundingbox.east.coordinate = value)
        )}
      >
        <DirectionInput
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          options={longitudeDirections}
          value={dms.boundingbox.east.direction}
          onChange={setState(
            (draft: any, value: any) => (draft.dms.boundingbox.east.direction = value)
          )}
        />
      </DmsLongitude>
    </div>
  );
}

const LatLongDMS = (props: any) => {
  const { dms, setState } = props

  const inputs = {
    point: Point,
    line: Line,
    circle: Circle,
    polygon: Polygon,
    boundingbox: BoundingBox,
  }

  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const Component = inputs[dms.shape] || null

  return (
    <div>
      <Radio
        value={dms.shape}
        onChange={setState((draft: any, value: any) => (draft.dms.shape = value))}
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
  );
}

export default LatLongDMS;
