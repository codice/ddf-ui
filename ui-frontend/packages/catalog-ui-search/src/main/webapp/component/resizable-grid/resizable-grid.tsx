import * as React from 'react'
import Grid from '@material-ui/core/Grid'
import { Resizable, ResizableProps } from 're-resizable'
import styled from 'styled-components'
import Paper from '@material-ui/core/Paper'
import { createCtx } from '@connexta/atlas/typescript/context'
const wreqr = require('catalog-ui-search/src/main/webapp/js/wreqr.js')

export const AUTO_COLLAPSE_LENGTH = 300
export const STARTING_LENGTH = 550
export const COLLAPSED_LENGTH = 75

type ResizableGridType = React.ComponentType<
  ResizableProps & {
    component: any
    item: any
  }
>

const ResizableGrid = Grid as ResizableGridType

export const [
  useResizableGridContext,
  UseResizableGridContextProvider,
] = createCtx<useResizableGridType>()

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

export const useResizableGrid = (
  startingLength?: number
): useResizableGridType => {
  const [closed, setClosed] = React.useState(false)
  const [length, setLength] = React.useState(startingLength || STARTING_LENGTH)
  const [lastLength, setLastLength] = React.useState(
    startingLength || STARTING_LENGTH
  )
  const [dragging, setDragging] = React.useState(false)
  React.useEffect(
    () => {
      if (!dragging) {
        if (length < AUTO_COLLAPSE_LENGTH) {
          setClosed(true)
          setLength(COLLAPSED_LENGTH)
        } else {
          setLastLength(length)
          setClosed(false)
        }
      }

      setTimeout(() => {
        wreqr.vent.trigger('gl-updateSize')
        wreqr.vent.trigger('resize')
      }, 0)
    },
    [length, dragging]
  )
  React.useEffect(
    () => {
      if (closed && length !== COLLAPSED_LENGTH) {
        setLastLength(length)
        setLength(COLLAPSED_LENGTH)
      }
    },
    [closed]
  )
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
}

export const SplitPane = ({
  firstStyle,
  secondStyle,
  variant,
  children,
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
  } = useResizableGrid()
  const [First, Second] = children

  // const MemoFirst = React.useMemo(
  //   () => {
  //     return First
  //   },
  //   [children]
  // )

  // const MemoSecond = React.useMemo(
  //   () => {
  //     return <Second />
  //   },
  //   [Second]
  // )
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
          minWidth={COLLAPSED_LENGTH}
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
            flexShrink: 1,
            zIndex: 1,
          }}
          onResizeStop={e => {
            setDragging(false)
          }}
          onResizeStart={() => {
            setDragging(true)
          }}
          onResize={e => {
            switch (variant) {
              case 'horizontal':
                setLength(
                  e.clientX - e.target.parentElement.getBoundingClientRect().x
                )
                break
              case 'vertical':
                setLength(
                  e.clientY - e.target.parentElement.getBoundingClientRect().y
                )
                break
            }
          }}
        >
          <Grid
            container
            style={{ height: '100%', width: '100%' }}
            wrap="nowrap"
          >
            <Paper
              style={{
                height: '100%',
                width: '100%',
                position: 'relative',
                ...firstStyle,
              }}
              elevation={24}
            >
              {First}
            </Paper>
          </Grid>
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
