/* Copyright (c) Connexta, LLC */
import React, { useState } from 'react'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'cesi... Remove this comment to see the full error message
import Cesium from 'cesium/Build/Cesium/Cesium'

export type InteractionsContextType = {
  interactiveGeo: number | null
  setInteractiveGeo: (interactiveGeo: number | null) => void
  moveFrom: Cesium.Cartesian3
  setMoveFrom: (moveFrom: Cesium.Cartesian3 | null) => void
  moveTo: Cesium.Cartesian3
  setMoveTo: (moveTo: Cesium.Cartesian3 | null) => void
  finalizeMove: () => void
}

export const InteractionsContext = React.createContext<InteractionsContextType>(
  {
    interactiveGeo: null,
    setInteractiveGeo: () => {},
    moveFrom: null,
    setMoveFrom: () => {},
    moveTo: null,
    setMoveTo: () => {},
    finalizeMove: () => {},
  }
)

export function InteractionsProvider({ children }: any) {
  const [interactiveGeo, setInteractiveGeo] = useState<number | null>(null)
  const [moveFrom, setMoveFrom] = useState<Cesium.Cartesian3 | null>(null)
  const [moveTo, setMoveTo] = useState<Cesium.Cartesian3 | null>(null)

  const finalizeMove = () => {}

  return (
    <InteractionsContext.Provider
      value={{
        interactiveGeo,
        setInteractiveGeo,
        moveFrom,
        setMoveFrom,
        moveTo,
        setMoveTo,
        finalizeMove,
      }}
    >
      {children}
    </InteractionsContext.Provider>
  )
}
