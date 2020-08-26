import * as React from 'react'
import Box, { BoxProps } from '@material-ui/core/Box'
import { hot } from 'react-hot-loader'
import useTheme from '@material-ui/core/styles/useTheme'

const Swath = (props: BoxProps) => {
  const theme = useTheme()
  return (
    <Box
      {...props}
      bgcolor={theme.palette.type === 'dark' ? 'divider' : 'divider'}
    />
  )
}

export default hot(module)(Swath)
