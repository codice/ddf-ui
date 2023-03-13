import React from 'react'

export const enterKeySubmitEventName = 'enter key submit'

export type CustomEventType = CustomEvent<React.SyntheticEvent>

export const EnterKeySubmitEventHandler = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    dispatchEnterKeySubmitEvent(e)
  }
}

export const EnterKeySubmitProps: Required<Pick<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'onKeyUp'
>> = {
  onKeyUp: EnterKeySubmitEventHandler,
}

export const dispatchEnterKeySubmitEvent = (e: React.SyntheticEvent) => {
  const customEvent = new CustomEvent(enterKeySubmitEventName, {
    detail: e,
    bubbles: true,
  })
  e.target.dispatchEvent(customEvent)
}

export const useListenToEnterKeySubmitEvent = ({
  callback,
}: {
  callback: (e: CustomEventType) => void
}) => {
  const [element, setElement] = React.useState<HTMLElement | null>(null)

  React.useEffect(() => {
    if (element) {
      element.addEventListener(enterKeySubmitEventName, callback)
      return () => {
        element.removeEventListener(enterKeySubmitEventName, callback)
      }
    }
    return () => {}
  }, [element, callback])
  return {
    setElement,
  }
}
