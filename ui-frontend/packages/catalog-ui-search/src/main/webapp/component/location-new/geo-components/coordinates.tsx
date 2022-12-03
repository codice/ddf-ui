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

import TextField from '../../../react-component/text-field/index';
import MaskedTextField from '../inputs/masked-text-field';
// @ts-expect-error ts-migrate(2614) FIXME: Module '"./masks"' has no exported member 'latitud... Remove this comment to see the full error message
import { latitudeDMSMask, longitudeDMSMask } from './masks';
import { buildDmsString, parseDmsCoordinate } from '../utils/dms-utils';

const Coordinate = (props: any) => {
  const { placeholder, value, onChange, children, ...otherProps } = props
  return (
    <div className="flex flex-row items-center w-full flex-no-wrap">
      <TextField
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...otherProps}
      />
      {children}
    </div>
  )
}

const MaskedCoordinate = (props: any) => {
  const { placeholder, mask, value, onChange, children, ...otherProps } = props
  return (
    <div className="flex flex-row items-center w-full flex-no-wrap">
      <MaskedTextField
        placeholder={placeholder}
        mask={mask}
        value={value}
        onChange={onChange}
        {...otherProps}
      />
      {children}
    </div>
  )
}

const DmsLatitude = (props: any) => {
  return (
    <MaskedCoordinate
      placeholder="dd°mm'ss.sss&quot;"
      mask={latitudeDMSMask}
      placeholderChar="_"
      {...props}
      onBlur={(event: any) => {
        props.onChange(
          buildDmsString(parseDmsCoordinate(props.value)),
          event.type
        )
      }}
    />
  );
}

const DmsLongitude = (props: any) => {
  return (
    <MaskedCoordinate
      placeholder="ddd°mm'ss.sss&quot;"
      mask={longitudeDMSMask}
      placeholderChar="_"
      {...props}
      onBlur={(event: any) => {
        props.onChange(
          buildDmsString(parseDmsCoordinate(props.value)),
          event.type
        )
      }}
    />
  );
}

const DdLatitude = (props: any) => {
  return (
    <Coordinate
      placeholder="latitude"
      type="number"
      step="any"
      min={-90}
      max={90}
      addon="°"
      {...props}
    />
  )
}

const DdLongitude = (props: any) => {
  return (
    <Coordinate
      placeholder="longitude"
      type="number"
      step="any"
      min={-180}
      max={180}
      addon="°"
      {...props}
    />
  )
}

const UsngCoordinate = (props: any) => {
  return (
    <div className="coordinate">
      <TextField label="Grid" {...props} />
    </div>
  )
}

export default {
  DmsLatitude,
  DmsLongitude,
  DdLatitude,
  DdLongitude,
  UsngCoordinate,
};
