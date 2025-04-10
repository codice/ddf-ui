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

import styled from 'styled-components'

import { FormattedMessage } from 'react-intl'

const Root = styled.div`
  display: block;
  width: 100%;
  height: auto;
  font-size: ${(props) => props.theme.largeFontSize};
  text-align: center;
  padding: ${(props) => props.theme.largeSpacing} 0px;
`

type Props = {
  amountDown: number
}

export default ({ amountDown }: Props) => {
  return (
    <Root>
      {amountDown == 0 ? (
        <FormattedMessage
          id="sources.available"
          defaultMessage="All sources are currently up"
        />
      ) : (
        <FormattedMessage
          id="sources.unavailable"
          defaultMessage="{amountDown} {amountDown, plural, one {source is} other {sources are}} currently down"
          values={{ amountDown }}
        />
      )}
    </Root>
  )
}
