import Backbone from 'backbone'
import * as React from 'react'

export type WithBackboneProps = {
  listenTo: (object: any, events: string, callback: Function) => any
  stopListening: (
    object?: any,
    events?: string | undefined,
    callback?: Function | undefined
  ) => any
  listenToOnce: (object: any, events: string, callback: Function) => any
}

export function useBackbone(): WithBackboneProps {
  const backboneModel = new Backbone.Model({})
  React.useEffect(() => {
    return () => {
      backboneModel.stopListening()
      backboneModel.destroy()
    }
  }, [])
  return {
    listenTo: backboneModel.listenTo.bind(backboneModel),
    stopListening: backboneModel.stopListening.bind(backboneModel),
    listenToOnce: backboneModel.listenToOnce.bind(backboneModel),
  }
}

/**
 *  This is the most common use case.  You start listening at the first lifecycle (render), and stop listening at the last lifecycle (destruction).
 *  If the paremeters ever change, we unlisten to the old case and relisten with the new parameters (object, events, callback).
 *
 *  For more complex uses, it's better to use useBackbone which gives you more control.
 * @param parameters
 */
export function useListenTo(
  ...parameters: Parameters<WithBackboneProps['listenTo']>
) {
  const { listenTo, stopListening } = useBackbone()
  React.useEffect(() => {
    if (parameters[0]) {
      listenTo.apply(undefined, parameters)
    }
    return () => {
      if (parameters[0]) {
        stopListening.apply(undefined, parameters)
      }
    }
  }, [parameters])
}
