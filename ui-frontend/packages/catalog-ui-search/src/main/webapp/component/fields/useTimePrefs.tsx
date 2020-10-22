import { useState, useEffect } from 'react'
import { useBackbone } from '../selection-checkbox/useBackbone.hook'
// @ts-ignore ts-migrate(7016) FIXME: Could not find a declaration file for module '../s... Remove this comment to see the full error message
import user from '../singletons/user-instance'

const useTimePrefs = () => {
  const { listenTo } = useBackbone()
  const [, setForceRender] = useState(Math.random())

  useEffect(() => {
    listenTo(
      user.getPreferences(),
      'change:dateTimeFormat change:timeZone',
      () => {
        setForceRender(Math.random())
      }
    )
  }, [])
}

export default useTimePrefs
