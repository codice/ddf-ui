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

import Sources from '../../js/model/Sources'
import { StartupDataStore } from '../../js/model/Startup/startup'
const SourcesInstance = new Sources(StartupDataStore.data?.sources) as {
  getHarvested: () => string[]
  localCatalog: string
  toJSON: () => {
    available: boolean
    contentTypes: { name: string; version: string; value: string }[]
    id: string
    local?: boolean
    version: string
  }[]
  once: any
}
export default SourcesInstance
