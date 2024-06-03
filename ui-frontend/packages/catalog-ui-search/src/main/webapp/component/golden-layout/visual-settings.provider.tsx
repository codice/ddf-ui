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

type LayoutContextType = {
  getValue: (key: string, defaultValue?: any) => any
  setValue: (key: string, value: any) => void
  onStateChanged: (callback: () => void) => void
  visualTitle: string
}

export const LayoutContext = React.createContext<LayoutContextType>({
  getValue: () => {},
  setValue: () => {},
  onStateChanged: (callback: () => void) => callback(),
  visualTitle: '',
})

type VisualSettingsProviderProps = {
  container: any
  goldenLayout: any
  children: React.ReactNode
}

export const VisualSettingsProvider = (props: VisualSettingsProviderProps) => {
  const { container, goldenLayout, children } = props

  const getVisualSettingValue = (key: string, defaultValue?: any) => {
    let settingsVal = container.getState()?.[key]

    if ((!settingsVal || settingsVal.length === 0) && defaultValue) {
      settingsVal = defaultValue
    }
    return settingsVal
  }

  const setVisualSettingValue = (key: string, value: any) => {
    container.setState({ ...(container.getState() || {}), [key]: value })
  }

  const onVisualSettingChangedListener = (callback: () => void) => {
    goldenLayout.on('stateChanged', () => callback())
  }

  return (
    <LayoutContext.Provider
      value={{
        getValue: getVisualSettingValue,
        setValue: setVisualSettingValue,
        onStateChanged: onVisualSettingChangedListener,
        visualTitle: container.title,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}
