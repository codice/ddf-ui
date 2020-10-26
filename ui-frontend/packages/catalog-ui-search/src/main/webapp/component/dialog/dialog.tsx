import * as React from 'react'
import Dialog, { DialogProps } from '@material-ui/core/Dialog'
import { createCtx } from './../../typescript/context'
import { Omit } from 'utility-types'
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

const [
  // ts-ignore declared but never used
  useControlledDialogContext,
  ControlledDialogContextProvider,
] = createCtx<{
  props: DialogProps
  setProps: setType<Partial<DialogProps>>
}>()

type ControlledDialogProps = {
  children: ({
    setProps,
    props,
  }: {
    setProps: setType<Partial<DialogProps>>
    props: DialogProps
  }) => DialogProps['children']
  content: ({
    setProps,
    props,
  }: {
    setProps: setType<Partial<DialogProps>>
    props: DialogProps
  }) => DialogProps['children']
} & Omit<Partial<DialogProps>, 'children'>

export const ControlledDialog = ({
  content,
  children,
  ...initialDialogProps
}: ControlledDialogProps) => {
  const [dialogProps, setDialogProps] = React.useState({
    open: false,
    onClose: () => {
      setDialogProps({
        ...dialogProps,
        open: false,
      })
    },
    ...initialDialogProps,
  } as DialogProps)

  const setProps = (props: Partial<DialogProps>) => {
    setDialogProps({
      ...dialogProps,
      ...props,
    })
  }

  return (
    <ControlledDialogContextProvider
      value={{
        setProps,
        props: dialogProps,
      }}
    >
      {children({ setProps, props: dialogProps })}
      <Dialog {...dialogProps}>
        {content({ setProps, props: dialogProps })}
      </Dialog>
    </ControlledDialogContextProvider>
  )
}
