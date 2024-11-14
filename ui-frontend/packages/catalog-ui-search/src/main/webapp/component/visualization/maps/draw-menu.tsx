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

export const Editor = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 38px;
  z-index: 1;
  > div:first-of-type {
    flex-wrap: wrap;
    > div:nth-of-type(2) {
      flex-wrap: wrap;
      width: 100%;
      background: inherit;
    }
  }
`
