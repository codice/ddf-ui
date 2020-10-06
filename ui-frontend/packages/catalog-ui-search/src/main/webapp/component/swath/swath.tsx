import * as React from 'react'
import { BoxProps } from '@material-ui/core/Box'
import { hot } from 'react-hot-loader'

const Swath = (props: BoxProps) => {
  const { className, ...otherProps } = props
  return (
    <div
      className={`${className ? className : ''} Mui-bg-divider`}
      {...otherProps}
    />
  )
}

export default hot(module)(Swath)
