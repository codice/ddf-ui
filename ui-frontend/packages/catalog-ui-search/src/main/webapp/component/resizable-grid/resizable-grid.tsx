import * as React from 'react'
import Grid from '@mui/material/Grid'
import { Resizable, ResizableProps } from 're-resizable'
import styled from 'styled-components'
import { createCtx } from '../../typescript/context'
import wreqr from '../../js/wreqr'
export const DEFAULT_AUTO_COLLAPSE_LENGTH = 300
export const DEFAULT_STARTING_LENGTH = 550
export const DEFAULT_COLLAPSED_LENGTH = 75
type ResizableGridType = React.ComponentType<
  React.PropsWithChildren<
    ResizableProps & {
      component: any
      item: any
    }
  >
>
const ResizableGrid = Grid as ResizableGridType
export const [useResizableGridContext, UseResizableGridContextProvider] =
  createCtx<useResizableGridType>({
    closed: false,
  })
type useResizableGridType = {
  length: number
  closed: boolean
  setClosed: React.Dispatch<boolean>
  setLength: React.Dispatch<React.SetStateAction<number>>
  lastLength: number
  setLastLength: React.Dispatch<React.SetStateAction<number>>
  dragging: boolean
  setDragging: React.Dispatch<React.SetStateAction<boolean>>
}
export const useResizableGrid = ({
  startingLength = DEFAULT_STARTING_LENGTH,
  collapsedLength = DEFAULT_COLLAPSED_LENGTH,
  autoCollapseLength = DEFAULT_AUTO_COLLAPSE_LENGTH,
}: {
  startingLength?: number
  collapsedLength?: number
  autoCollapseLength?: number
} = {}): useResizableGridType => {
  const [closed, setClosed] = React.useState(false)
  const [length, setLength] = React.useState(startingLength)
  const [lastLength, setLastLength] = React.useState(startingLength)
  const [dragging, setDragging] = React.useState(false)
  React.useEffect(() => {
    if (!dragging) {
      if (length < autoCollapseLength) {
        setClosed(true)
        setLength(collapsedLength)
      } else {
        setLastLength(length)
        setClosed(false)
      }
    }
    setTimeout(() => {
      ;(wreqr as any).vent.trigger('gl-updateSize')
      ;(wreqr as any).vent.trigger('resize')
    }, 500)
  }, [length, dragging])
  React.useEffect(() => {
    if (closed && length !== collapsedLength) {
      setLastLength(length)
      setLength(collapsedLength)
    }
  }, [closed])
  return {
    length,
    closed,
    setClosed,
    setLength,
    lastLength,
    setLastLength,
    dragging,
    setDragging,
  }
}
export const CustomResizableGrid = styled(ResizableGrid)`
  .actions {
    opacity: 0;
    transform: translateX(-100%);
    transition: opacity 0.2s ease-in-out 0.5s, transform 0.2s ease-in-out 0.5s;
  }
  > span > div:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  :focus-within .actions,
  :hover .actions {
    opacity: 1;
    transform: translateX(-50%);
    transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
  }
  .actions > div + div {
    margin-top: 10px;
  }
`
type SplitPaneProps = {
  firstStyle?: React.CSSProperties | undefined
  secondStyle?: React.CSSProperties | undefined
  variant: 'horizontal' | 'vertical'
  children: [React.ReactNode, React.ReactNode]
  collapsedLength?: number
  autoCollapseLength?: number
  startingLength?: number
  controlled?: useResizableGridType // useful to have immediate access to closed without needing to split out components
}

export const SplitPane = ({
  secondStyle,
  variant,
  children,
  collapsedLength = DEFAULT_COLLAPSED_LENGTH,
  autoCollapseLength = DEFAULT_AUTO_COLLAPSE_LENGTH,
  startingLength = DEFAULT_STARTING_LENGTH,
  controlled,
}: SplitPaneProps) => {
  const {
    length,
    closed,
    setClosed,
    setLength,
    lastLength,
    setLastLength,
    dragging,
    setDragging,
  } =
    controlled ||
    useResizableGrid({
      startingLength,
      collapsedLength,
      autoCollapseLength,
    })
  const [First, Second] = children
  return (
    <UseResizableGridContextProvider
      value={{
        length,
        closed,
        setClosed,
        setLength,
        lastLength,
        setLastLength,
        dragging,
        setDragging,
      }}
    >
      <Grid
        container
        wrap="nowrap"
        direction={(() => {
          switch (variant) {
            case 'horizontal':
              return 'row'
            case 'vertical':
              return 'column'
          }
        })()}
        className="w-full h-full"
      >
        <CustomResizableGrid
          component={Resizable}
          item
          size={(() => {
            switch (variant) {
              case 'horizontal':
                return {
                  width: length,
                  height: '100%',
                }
              case 'vertical':
                return {
                  width: '100%',
                  height: length,
                }
            }
          })()}
          minWidth={collapsedLength}
          enable={(() => {
            switch (variant) {
              case 'horizontal':
                return {
                  top: false,
                  right: true,
                  bottom: false,
                  left: false,
                  topRight: false,
                  bottomRight: false,
                  bottomLeft: false,
                  topLeft: false,
                }
              case 'vertical':
                return {
                  top: false,
                  right: false,
                  bottom: true,
                  left: false,
                  topRight: false,
                  bottomRight: false,
                  bottomLeft: false,
                  topLeft: false,
                }
            }
          })()}
          style={{
            flexShrink: 0,
          }}
          onResizeStop={() => {
            setDragging(false)
          }}
          onResizeStart={() => {
            setDragging(true)
          }}
          onResize={(e) => {
            switch (variant) {
              case 'horizontal':
                setLength(
                  (e as any).clientX -
                    (e.target as any).parentElement.getBoundingClientRect().x
                )
                break
              case 'vertical':
                setLength(
                  (e as any).clientY -
                    (e.target as any).parentElement.getBoundingClientRect().y
                )
                break
            }
          }}
          className="z-10 pr-2"
        >
          {First}
        </CustomResizableGrid>
        <Grid
          item
          style={(() => {
            switch (variant) {
              case 'horizontal':
                return {
                  height: '100%',
                  width: `calc(100% - ${length}px)`,
                  flexShrink: 1,
                  ...secondStyle,
                }
              case 'vertical':
                return {
                  height: `calc(100% - ${length}px)`,
                  width: '100%',
                  flexShrink: 1,
                  ...secondStyle,
                }
            }
          })()}
        >
          {Second}
        </Grid>
      </Grid>
    </UseResizableGridContextProvider>
  )
}
