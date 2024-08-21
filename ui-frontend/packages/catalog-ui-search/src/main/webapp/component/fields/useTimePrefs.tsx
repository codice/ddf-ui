import { useState, useEffect } from 'react'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import user from '../singletons/user-instance'

const useTimePrefs = (action?: () => void) => {
  const { listenTo, stopListening } = useBackbone()
  const [, setForceRender] = useState(Math.random())

  useEffect(() => {
    const callback = () => {
      setForceRender(Math.random())
      action && action()
    }
    listenTo(
      user.getPreferences(),
      'change:dateTimeFormat change:timeZone',
      callback
    )
    return () =>
      stopListening(
        user.getPreferences(),
        'change:dateTimeFormat change:timeZone',
        callback
      )
  }, [action])
}

export default useTimePrefs
