import * as React from 'react'
import { hot } from 'react-hot-loader'
import useTheme from '@material-ui/core/styles/useTheme'
import Divider, { DividerProps } from '@material-ui/core/Divider'
import { dark, light } from '../theme/theme'

export const DarkDivider = (props: DividerProps) => {
  const theme = useTheme()
  const { style, ...otherProps } = props
  return (
    <Divider
      {...otherProps}
      style={{
        backgroundColor:
          theme.palette.type === 'dark' ? dark.background : light.background,
        ...style,
      }}
    />
  )
}

export default hot(module)(DarkDivider)
