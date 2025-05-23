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
// import original module declarations
import 'styled-components'
import { ThemeInterface } from '../../src/main/webapp/react-component/styles/styled-components'

// and extend them!
declare module 'styled-components' {
  // In v6, we directly use the theme type instead of extending DefaultTheme
  type Theme = ThemeInterface
  export interface DefaultTheme extends ThemeInterface {}

  // Updated keyframes signature for v6
  export function keyframes(
    strings: TemplateStringsArray | string,
    ...interpolations: any[]
  ): string
}
