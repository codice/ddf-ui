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

// @ts-expect-error ts-migrate(2614) FIXME: Module '"../../../react-component/radio/index.js"'... Remove this comment to see the full error message
import { Radio, RadioItem } from '../../../react-component/radio/index';
import TextField from '../../../react-component/text-field/index';
// @ts-expect-error ts-migrate(2614) FIXME: Module '"../../../react-component/location/common.... Remove this comment to see the full error message
import { Units } from '../../../react-component/location/common';
import ListEditor from '../inputs/list-editor';
// @ts-expect-error ts-migrate(2614) FIXME: Module '"./coordinates"' has no exported member 'U... Remove this comment to see the full error message
import { UsngCoordinate } from './coordinates';

const Point = (props: any) => {
  const { usng, setState } = props
  return (
    <UsngCoordinate
      value={usng.point}
      onChange={setState((draft: any, value: any) => (draft.usng.point = value))}
    />
  );
}

const Circle = (props: any) => {
  const { usng, setState } = props
  return (
    <div className="flex flex-col flex-no-wrap space-y-2">
      <UsngCoordinate
        value={usng.circle.point}
        onChange={setState((draft: any, value: any) => (draft.usng.circle.point = value))}
      />
      <Units
        value={usng.circle.units}
        onChange={setState((draft: any, value: any) => (draft.usng.circle.units = value))}
      >
        <TextField
          // @ts-expect-error ts-migrate(2322) FIXME: Type '{ label: string; type: string; value: any; o... Remove this comment to see the full error message
          label="Radius"
          type="number"
          value={usng.circle.radius}
          onChange={setState(
            (draft: any, value: any) => (draft.usng.circle.radius = value)
          )}
        />
      </Units>
    </div>
  );
}

const Line = (props: any) => {
  const { usng, setState } = props
  // @ts-expect-error ts-migrate(6133) FIXME: 'entry' is declared but its value is never read.
  const grids = usng.line.list.map((entry: any, index: any) => (
    <UsngCoordinate
      value={usng.line.list[index]}
      onChange={setState(
        (draft: any, value: any) => (draft.usng.line.list[index] = value)
      )}
      key={index}
    />
  ))

  return (
    <ListEditor
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      list={usng.line.list}
      defaultItem=""
      onChange={setState((draft: any, value: any) => (draft.usng.line.list = value))}
    >
      {grids}
    </ListEditor>
  );
}

const Polygon = (props: any) => {
  const { usng, setState } = props
  // @ts-expect-error ts-migrate(6133) FIXME: 'entry' is declared but its value is never read.
  const grids = usng.polygon.list.map((entry: any, index: any) => (
    <UsngCoordinate
      value={usng.polygon.list[index]}
      onChange={setState(
        (draft: any, value: any) => (draft.usng.polygon.list[index] = value)
      )}
      key={index}
    />
  ))

  return (
    <ListEditor
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      list={usng.polygon.list}
      defaultItem=""
      onChange={setState((draft: any, value: any) => (draft.usng.polygon.list = value))}
    >
      {grids}
    </ListEditor>
  );
}

const BoundingBox = (props: any) => {
  const { usng, setState } = props
  return (
    <UsngCoordinate
      value={usng.boundingbox}
      onChange={setState((draft: any, value: any) => (draft.usng.boundingbox = value))}
    />
  );
}

const USNG = (props: any) => {
  const { usng, setState } = props

  const inputs = {
    point: Point,
    circle: Circle,
    line: Line,
    polygon: Polygon,
    boundingbox: BoundingBox,
  }

  // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
  const Component = inputs[usng.shape] || null

  return (
    <div>
      <Radio
        value={usng.shape}
        onChange={setState((draft: any, value: any) => (draft.usng.shape = value))}
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

export default USNG;
