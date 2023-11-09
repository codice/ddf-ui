/* Copyright (c) Connexta, LLC */
import React, { useState } from 'react'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium'
import Backbone from 'backbone'

export type Translation = {
  longitude: number
  latitude: number
}

export type InteractionsContextType = {
  interactiveGeo: number | null
  setInteractiveGeo: (interactiveGeo: number | null) => void
  interactiveModels: Backbone.Model[]
  setInteractiveModels: (models: Backbone.Model[]) => void
  moveFrom: Cesium.Cartographic | null
  setMoveFrom: (moveFrom: Cesium.Cartographic | null) => void
  translation: Translation | null
  setTranslation: (translation: Translation | null) => void
}

export const InteractionsContext = React.createContext<InteractionsContextType>(
  {
    interactiveGeo: null,
    setInteractiveGeo: () => {},
    interactiveModels: [],
    setInteractiveModels: () => {},
    moveFrom: null,
    setMoveFrom: () => {},
    translation: null,
    setTranslation: () => {},
  }
)

export function InteractionsProvider({ children }: any) {
  const [interactiveGeo, setInteractiveGeo] = useState<number | null>(null)
  const [interactiveModels, setInteractiveModels] = useState<Backbone.Model[]>(
    []
  )
  const [moveFrom, setMoveFrom] = useState<Cesium.Cartographic | null>(null)
  const [translation, setTranslation] = useState<Translation | null>(null)

  return (
    <InteractionsContext.Provider
      value={{
        interactiveGeo,
        setInteractiveGeo,
        interactiveModels,
        setInteractiveModels,
        moveFrom,
        setMoveFrom,
        translation,
        setTranslation,
      }}
    >
      {children}
    </InteractionsContext.Provider>
  )
}
