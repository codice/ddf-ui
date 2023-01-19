import { useState, useEffect } from 'react'
import { convertWktToPreferredCoordFormat } from './coordinateConverter'
import { useBackbone } from '../../selection-checkbox/useBackbone.hook'
import user from '../../singletons/user-instance'

const FLOATING_POINT_PAIR_REGEX = /[-+]?\d*\.?\d+\s[-+]?\d*\.?\d+/g

/**
 * Returns a function responsible for converting wkts to the user's preferred
 * coordinate format
 */
const conversionHigherOrderFunction = () => (value: string) =>
  value.replace(FLOATING_POINT_PAIR_REGEX, convertWktToPreferredCoordFormat)

/**
 * Provides a hook for converting wkts to the user's preferred
 * coordinate format
 */
const useCoordinateFormat = () => {
  const [convert, setConverter] = useState(conversionHigherOrderFunction)
  const { listenTo } = useBackbone()

  useEffect(() => {
    const callback = () => setConverter(conversionHigherOrderFunction)

    listenTo(
      user.get('user').get('preferences'),
      'change:coordinateFormat',
      callback
    )
  }, [])

  return convert
}

export default useCoordinateFormat
