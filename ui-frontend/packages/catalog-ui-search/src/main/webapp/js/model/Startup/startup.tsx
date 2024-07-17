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
import { Subscribable } from '../Base/base-classes' // Import Subscribable from base-classes module
import { StartupPayloadType } from './startup.types'
import { Sources } from './sources'
import fetch from '../../../react-component/utils/fetch/fetch'
import { Configuration } from './configuration'
import { MetacardDefinitions } from './metacard-definitions'

export class StartupData extends Subscribable<{
  thing: 'fetched'
  args: StartupPayloadType
}> {
  data?: Omit<
    StartupPayloadType,
    | 'sources'
    | 'harvestedSources'
    | 'localSourceId'
    | 'config'
    | 'platformUIConfiguration'
    | 'attributeMap'
    | 'sortedAttributes'
    | 'metacardTypes'
  >
  Sources: Sources
  Configuration: Configuration
  MetacardDefinitions: MetacardDefinitions
  constructor() {
    super()
    this.Configuration = new Configuration(this)
    this.Sources = new Sources(this)
    this.MetacardDefinitions = new MetacardDefinitions(this)
    this.fetch()
  }
  handleEnhancedRoles() {
    /**
     *  The "path=/" part is so the cookie is included / available to all domain paths
     */
    document.cookie = `useElevatedRights=${
      this.data?.user.preferences.actingRole === 'enhanced'
    }; path=/`
  }
  fetch() {
    fetch('./internal/compose/startup')
      .then((response) => response.json())
      .then((startupPayload: StartupPayloadType) => {
        this.data = startupPayload
        this.handleEnhancedRoles()
        this._notifySubscribers({ thing: 'fetched', args: startupPayload })
      })
  }
}

export const StartupDataStore = new StartupData()
