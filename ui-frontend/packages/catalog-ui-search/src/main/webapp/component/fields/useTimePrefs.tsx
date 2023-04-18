import { useState, useEffect } from 'react'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
import user from '../singletons/user-instance'

const useTimePrefs = () => {
  const { listenTo } = useBackbone()
  const [, setForceRender] = useState(Math.random())

  useEffect(() => {
    listenTo(
      user.getPreferences(),
      'change:dateTimeFormat change:timePrecision change:timeZone',
      () => {
        setForceRender(Math.random())
      }
    )
  }, [])
}

export default useTimePrefs
