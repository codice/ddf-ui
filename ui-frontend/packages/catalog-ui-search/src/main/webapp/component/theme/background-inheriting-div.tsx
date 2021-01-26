import * as React from 'react'
import { hot } from 'react-hot-loader'

/**
 * CSS is a bit lacking when it comes to inheriting backgrounds, so this let's the dev do so a bit easier
 */
const BackgroundInheritingDiv = (props: React.ComponentProps<'div'>) => {
  const { style, ...otherProps } = props
  const divRef = React.useRef<HTMLDivElement>(null)
  const [background, setBackground] = React.useState(null as null | string)
  React.useEffect(() => {
    if (divRef.current) {
      let parentColor = divRef.current as string | HTMLElement
      while (
        typeof parentColor !== 'string' &&
        !parentColor.classList.contains('MuiPaper-root')
      ) {
        if (parentColor.parentElement) parentColor = parentColor.parentElement
      }
      if (typeof parentColor !== 'string') {
        setBackground(getComputedStyle(parentColor).backgroundColor)
      }
    }
  }, [])
  return (
    <div
      {...otherProps}
      ref={divRef}
      style={{
        ...style,
        ...(background ? { background } : {}),
      }}
    />
  )
}

export default hot(module)(BackgroundInheritingDiv)
