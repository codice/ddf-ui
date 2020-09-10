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
import styled from 'styled-components'
import { getFilteredAttributeList } from './filterHelper'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module '../i... Remove this comment to see the full error message
import EnumInput from '../inputs/enum-input'
const metacardDefinitions = require('../../component/singletons/metacard-definitions')

const Root = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin-right: ${({ theme }) => theme.minimumSpacing};
`

const FilterAttributeDropdown = ({
  onChange,
  includedAttributes,
  editing,
  value,
}: any) => {
  return (
    <Root>
      {editing ? (
        <EnumInput
          value={value}
          // @ts-expect-error ts-migrate(2554) FIXME: Expected 0 arguments, but got 1.
          suggestions={getFilteredAttributeList(includedAttributes)}
          onChange={onChange}
        />
      ) : (
        metacardDefinitions.getLabel(value)
      )}
    </Root>
  )
}

export default FilterAttributeDropdown
