import * as React from 'react'
import styled from 'styled-components'

const Root = styled.div<{ pos: { x: number; y: number } }>`
  position: absolute;
  top: ${(props: any) => props.pos.y}px;
  left: ${(props: any) => props.pos.x}px;
  color: white;
  background-color: rgba(0, 0, 0, 0.7);
  max-width: 30%;
  border-radius: 8px;
  padding: 10px;
  z-index: 1;
  pointer-events: none;
`

export type TooltipProps = {
  x: number
  y: number
  message: string | any
}

export const Tooltip = (props: TooltipProps) => {
  const { x, y, message } = props
  return (
    <Root pos={{ x, y }}>
      <span>{message}</span>
    </Root>
  )
}
