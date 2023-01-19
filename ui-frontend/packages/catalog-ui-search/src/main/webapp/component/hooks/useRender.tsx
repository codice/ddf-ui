import React from 'react'

/**
 *  Force your component to render
 */
export const useRender = () => {
  const [, setRender] = React.useState(Math.random())

  return () => {
    setRender(Math.random())
  }
}
