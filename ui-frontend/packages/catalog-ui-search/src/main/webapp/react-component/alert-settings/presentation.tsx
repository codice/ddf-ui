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
import { hot } from 'react-hot-loader'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'

type Props = {
  persistence: boolean
  expiration: number
  onExpirationChange: (v: number) => any
  onPersistenceChange: (v: boolean) => any
}
const millisecondsInDay = 24 * 60 * 60 * 1000
const expireOptions = [
  {
    label: '1 Day',
    value: millisecondsInDay,
  },
  {
    label: '2 Days',
    value: 2 * millisecondsInDay,
  },
  {
    label: '4 Days',
    value: 4 * millisecondsInDay,
  },
  {
    label: '1 Week',
    value: 7 * millisecondsInDay,
  },
  {
    label: '2 Weeks',
    value: 14 * millisecondsInDay,
  },
  {
    label: '1 Month',
    value: 30 * millisecondsInDay,
  },
  {
    label: '2 Months',
    value: 60 * millisecondsInDay,
  },
  {
    label: '4 Months',
    value: 120 * millisecondsInDay,
  },
  {
    label: '6 Months',
    value: 180 * millisecondsInDay,
  },
  {
    label: '1 Year',
    value: 365 * millisecondsInDay,
  },
] as { label: string; value: number }[]

const keepNotificationsOptions = [
  {
    label: 'Yes',
    value: true,
  },
  {
    label: 'No',
    value: false,
  },
] as { label: string; value: boolean }[]

const render = (props: Props) => {
  const { persistence, expiration, onExpirationChange, onPersistenceChange } =
    props

  return (
    <div className="p-2 w-full h-full overflow-auto">
      <div className="editor-properties">
        <div>
          <Autocomplete
            size="small"
            options={keepNotificationsOptions}
            onChange={(_e: any, newValue) => {
              onPersistenceChange(newValue.value)
            }}
            getOptionSelected={(option) => option.value === persistence}
            getOptionLabel={(option) => {
              return option.label
            }}
            disableClearable
            value={keepNotificationsOptions.find(
              (choice) => choice.value === persistence
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Keep notifications after logging out"
                variant="outlined"
              />
            )}
          />
        </div>
        <div className="pt-2">
          {persistence ? (
            <Autocomplete
              size="small"
              options={expireOptions}
              onChange={(_e: any, newValue) => {
                onExpirationChange(newValue.value)
              }}
              getOptionSelected={(option) => option.value === expiration}
              getOptionLabel={(option) => {
                return option.label
              }}
              disableClearable
              value={expireOptions.find(
                (choice) => choice.value === expiration
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Expire after"
                  variant="outlined"
                />
              )}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default hot(module)(render)
