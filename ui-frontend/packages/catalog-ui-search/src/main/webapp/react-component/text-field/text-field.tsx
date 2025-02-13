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

import Group from '../group'
import TextFieldMui from '@mui/material/TextField'

type Props = {
  value?: string
  onChange?: (...args: any[]) => any
}

const TextField = (props: Props) => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Props'.
  const { label, addon, value, type = 'text', onChange, ...rest } = props
  return (
    <Group>
      {label !== undefined ? (
        <span
          className="p-2 shrink-0 grow-0"
          style={{
            minWidth: '120px',
          }}
        >
          {label}
          &nbsp;
        </span>
      ) : null}
      <TextFieldMui
        size="small"
        variant="outlined"
        fullWidth
        className="shrink overflow-hidden"
        value={value !== undefined ? value : ''}
        type={type}
        onChange={(e) => {
          // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
          onChange(e.target.value)
        }}
        {...rest}
      />
      {addon !== undefined ? (
        <label className="p-2 shrink-0 grow-0">{addon}</label>
      ) : null}
    </Group>
  )
}

export default TextField
