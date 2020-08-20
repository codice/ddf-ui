import * as React from 'react'
// create context with no upfront defaultValue
// without having to do undefined check all the time
export function createCtx<A>(defaults?: Partial<A>) {
  const ctx = React.createContext<A | undefined>(defaults as A | undefined)
  function useCtx() {
    const c = React.useContext(ctx)
    if (!c) throw new Error('useCtx must be inside a Provider with a value')
    return c
  }
  return [useCtx, ctx.Provider] as const // make TypeScript infer a tuple, not an array of union types
}
