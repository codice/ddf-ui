import * as React from 'react'

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

export default Swath
