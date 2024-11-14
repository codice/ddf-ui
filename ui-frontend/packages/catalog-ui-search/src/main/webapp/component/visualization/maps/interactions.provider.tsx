/* Copyright (c) Connexta, LLC */
import React, { useState } from 'react'
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
  moveFrom: any
  setMoveFrom: (moveFrom: any) => void
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

/**
 *  Doing this to save time for now.  In the future we should remove the interactions provider and the logic around it, solely using the models themselves and
 *  this isInteractive being set to do drag / drop.
 */
function useUpdateModelsSoTheyAreInteractive({
  interactiveModels,
}: {
  interactiveModels: Backbone.Model[]
}) {
  React.useEffect(() => {
    interactiveModels.forEach((model) => {
      model.set('isInteractive', true)
    })
    return () => {
      interactiveModels.forEach((model) => {
        model.set('isInteractive', false)
      })
    }
  }, [interactiveModels])
}

export function InteractionsProvider({ children }: any) {
  const [interactiveGeo, setInteractiveGeo] = useState<number | null>(null)
  const [interactiveModels, setInteractiveModels] = useState<Backbone.Model[]>(
    []
  )
  const [moveFrom, setMoveFrom] = useState<any>(null)
  const [translation, setTranslation] = useState<Translation | null>(null)

  useUpdateModelsSoTheyAreInteractive({ interactiveModels })

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
