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
import { StartupDataStore } from './startup'
import { useSyncExternalStore } from 'react'

export const StartupData = {
  useStartupData: () => {
    const startupData = useSyncExternalStore(
      StartupData.subscribe,
      StartupData.getSnapshot
    )
    return startupData
  },
  getSnapshot: () => {
    return StartupDataStore.data
  },
  subscribe: (callback: () => void) => {
    const cancelSubscription = StartupDataStore.subscribeTo({
      subscribableThing: 'fetched',
      callback,
    })
    return () => {
      cancelSubscription()
    }
  },
}

export const Sources = {
  useSources: () => {
    const sources = useSyncExternalStore(Sources.subscribe, Sources.getSnapshot)
    return sources
  },
  getSnapshot: () => {
    return StartupDataStore?.data?.sources || []
  },
  subscribe: (callback: () => void) => {
    const cancelSubscription = StartupDataStore.subscribeTo({
      subscribableThing: 'sources-update',
      callback,
    })
    return () => {
      cancelSubscription()
    }
  },
}
