import React from 'react'
import { LayoutConfig } from './golden-layout.types'

export const goldenLayoutChangeEventName = 'golden layout change'

export type GoldenLayoutChangeEventType = CustomEvent<{
  value: LayoutConfig
  goldenLayout: any
}>

export const dispatchGoldenLayoutChangeEvent = (
  target: HTMLElement,
  detail: GoldenLayoutChangeEventType['detail']
) => {
  const customEvent = new CustomEvent(goldenLayoutChangeEventName, {
    detail,
    bubbles: true,
  })
  target.dispatchEvent(customEvent)
}

export const useListenToGoldenLayoutChangeEvent = ({
  callback,
}: {
  callback: (e: GoldenLayoutChangeEventType) => void
}) => {
  const [element, setElement] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (element) {
      element.addEventListener(goldenLayoutChangeEventName, callback)
      return () => {
        element.removeEventListener(goldenLayoutChangeEventName, callback)
      }
    }
    return () => {}
  }, [element, callback])
  return {
    setElement,
  }
}
