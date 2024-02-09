// hooks to deal with the base classes
import React from 'react'
import { Subscribable, Overridable } from './base-classes'

export function useSubscribable<T extends { thing: string; args?: any }>(
  subscribable: Subscribable<T>,
  thing: T['thing'],
  callback: (val: T['args']) => void
) {
  React.useEffect(() => {
    return subscribable.subscribeTo({ subscribableThing: thing, callback })
  }, [subscribable, thing, callback])
}

export function useOverridable<T>(overridable: Overridable<T>) {
  const [value, setValue] = React.useState(overridable.get())
  useSubscribable(overridable, 'override', setValue)
  return value
}
