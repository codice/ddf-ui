import * as React from 'react'
import Drawer, { DrawerProps } from '@material-ui/core/Drawer'

import styled from 'styled-components'

export const WrappedDrawer = styled(
  React.forwardRef((props: DrawerProps, ref: React.Ref<any>) => {
    return <Drawer {...props} ref={ref} />
  })
)<DrawerProps>`` as React.ComponentType<DrawerProps>

type setType<T> = React.Dispatch<React.SetStateAction<T>>

type Props = {
  children: ({ setOpen }: { setOpen: setType<boolean> }) => React.ReactElement
  drawerChildren: ({
    setOpen,
  }: {
    setOpen: setType<boolean>
  }) => React.ReactElement
  drawerProps: DrawerProps
}

const DrawerContext = React.createContext({
  setOpen: () => {},
} as {
  setOpen: setType<boolean>
})

export const ControlledDrawer = ({
  children,
  drawerChildren,
  drawerProps,
}: Props) => {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      {children({ setOpen })}
      <DrawerContext.Provider
        value={{
          setOpen,
        }}
      >
        <Drawer
          open={open}
          onClose={() => {
            setOpen(false)
          }}
          {...drawerProps}
        >
          <>{drawerChildren({ setOpen })}</>
        </Drawer>
      </DrawerContext.Provider>
    </>
  )
}
