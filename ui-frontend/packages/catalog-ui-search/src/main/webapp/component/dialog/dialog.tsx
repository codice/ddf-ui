import * as React from 'react'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import { createCtx } from './../../typescript/context'
import { setType } from '../../typescript/hooks'

const [useDialogContext, DialogContextProvider] = createCtx<{
  setProps: setType<Partial<DialogProps>>
}>()

type DialogProviderProps = {
  children?: React.ReactNode
  initialDialogProps?: DialogProps
}

export const useDialog = useDialogContext

export const DialogProvider = (props: DialogProviderProps) => {
  const [dialogProps, setDialogProps] = React.useState({
    maxWidth: 'lg',
    children: <></>,
    open: false,
    onClose: () => {
      setDialogProps({
        ...dialogProps,
        open: false,
      })
    },
    ...props.initialDialogProps,
  } as DialogProps)

  const setProps = (newProps: DialogProps) => {
    setDialogProps({
      ...dialogProps,
      ...newProps,
    })
  }

  return (
    <DialogContextProvider
      value={{
        setProps,
      }}
    >
      {props.children}
      <Dialog {...dialogProps} />
    </DialogContextProvider>
  )
}
