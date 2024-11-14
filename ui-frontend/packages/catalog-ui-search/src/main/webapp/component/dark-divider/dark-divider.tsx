import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useTheme } from '@mui/material/styles'
import Divider, { DividerProps } from '@mui/material/Divider'
import { dark, light } from '../theme/theme'

export const DarkDivider = (props: DividerProps) => {
  const theme = useTheme()
  const { style, ...otherProps } = props
  return (
    <Divider
      {...otherProps}
      style={{
        borderColor:
          theme.palette.mode === 'dark' ? dark.background : light.background,
        ...style,
      }}
    />
  )
}

export default hot(module)(DarkDivider)
