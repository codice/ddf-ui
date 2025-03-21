import * as React from 'react'
import { Route } from 'react-router-dom'
import { RouteContextProvider } from './app-root.pure'

type Props = {
  children?: React.ReactNode
}

export const InstanceRouteContextProvider = ({ children }: Props) => {
  return (
    <Route>
      {(routeProps: any) => {
        return (
          <RouteContextProvider value={{ routeProps }}>
            {children}
          </RouteContextProvider>
        )
      }}
    </Route>
  )
}
