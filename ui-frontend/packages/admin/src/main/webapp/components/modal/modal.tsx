import * as React from 'react'
import Modal, { ModalProps } from '@material-ui/core/Modal'
import CloseIcon from '@material-ui/icons/Close'
import styled from 'styled-components'
import { Subtract } from '../../typescript'
import Paper, { PaperProps } from '@material-ui/core/Paper'
import { Typography, Grid, Button, Divider } from '@material-ui/core'

export const WrappedModal = styled(
  React.forwardRef((props: ModalProps, ref: React.Ref<any>) => {
    return <Modal {...props} ref={ref} />
  })
)<ModalProps>`` as React.ComponentType<ModalProps>

const CustomPaper = styled(Paper)<{ width?: string }>`
  min-width: 20vw;
  margin: 100px auto auto auto;
  padding: 10px;
  max-height: calc(100% - 200px);
  overflow: auto;
  position: relative;
  max-width: ${({ width }) => (width ? width : '70vw')};
` as React.ComponentType<PaperProps & { width?: string }>

const HeaderTitle = styled(Typography)`
  flex-grow: 1;
`

const ModalContext = React.createContext({
  setOpen: () => {},
  onClose: () => {},
} as {
  setOpen: setType<boolean>
  onClose: (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => void
})

export const ModalHeader = ({ children }: { children?: React.ReactNode }) => {
  const modalContext = React.useContext(ModalContext)
  return (
    <>
      <Grid
        container
        alignItems="center"
        wrap="nowrap"
        style={{
          padding: '10px 0px',
        }}
      >
        <Grid item>
          <Button
            onClick={() => {
              modalContext.onClose({}, 'escapeKeyDown')
            }}
            style={{ visibility: 'hidden' }}
          >
            <CloseIcon />
          </Button>
        </Grid>
        <Grid item style={{ width: '100%' }}>
          <HeaderTitle variant="h5" align="center">
            {children}
          </HeaderTitle>
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              modalContext.onClose({}, 'escapeKeyDown')
            }}
          >
            <CloseIcon />
          </Button>
        </Grid>
      </Grid>
      <Divider style={{ margin: '0px -10px 20px -10px' }} />
    </>
  )
}

type setType<T> = React.Dispatch<React.SetStateAction<T>>
type Props = {
  /**
   * CSS Width to use for the modal. i.e. 100%, 10px, 40vw
   */
  width?: string
  children: ({ setOpen }: { setOpen: setType<boolean> }) => React.ReactElement
  modalChildren: ({
    setOpen,
  }: {
    setOpen: setType<boolean>
  }) => React.ReactElement
  defaultOpen?: boolean
  modalProps?: Subtract<
    ModalProps,
    {
      open: any
      children: any
    }
  >
  paperProps?: PaperProps
}

export const ControlledModal = ({
  children,
  modalChildren,
  width,
  defaultOpen = false,
  modalProps,
  paperProps,
}: Props) => {
  const [open, setOpen] = React.useState(defaultOpen)
  const onClose =
    modalProps && modalProps.onClose ? modalProps.onClose : () => setOpen(false)
  return (
    <>
      {children({ setOpen })}
      <ModalContext.Provider
        value={{
          setOpen,
          onClose,
        }}
      >
        <Modal open={open} onClose={onClose} {...modalProps}>
          <>
            <CustomPaper width={width} {...paperProps}>
              {modalChildren({ setOpen })}
            </CustomPaper>
          </>
        </Modal>
      </ModalContext.Provider>
    </>
  )
}
