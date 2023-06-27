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
import React from 'react'
import { StartupDataStore } from './startup'

const StartupContext = React.createContext(StartupDataStore.data)

export function useStartupData() {
  return React.useContext(StartupContext)
}

export function StartupProvider(props: any) {
  const [startupData, setStartupData] = React.useState(StartupDataStore.data)
  React.useEffect(() => {
    const handle = StartupDataStore.subscribeTo({
      subscribableThing: 'fetched',
      callback: () => {
        setStartupData(StartupDataStore.data)
      },
    })
    return () => {
      handle()
    }
  }, [])
  return (
    <StartupContext.Provider value={startupData}>
      {props.children}
    </StartupContext.Provider>
  )
}
