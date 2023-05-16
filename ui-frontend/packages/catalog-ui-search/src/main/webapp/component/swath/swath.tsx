import * as React from 'react'
import { hot } from 'react-hot-loader'

const Swath = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) => {
  const { className, ...otherProps } = props
  return (
    <div
      className={`${className ? className : ''} Mui-bg-divider`}
      {...otherProps}
    />
  )
}

export default hot(module)(Swath)
