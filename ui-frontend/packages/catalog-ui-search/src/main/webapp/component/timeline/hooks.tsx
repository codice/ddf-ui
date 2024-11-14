import moment, { Moment } from 'moment-timezone'
import { useState } from 'react'
import { Timescale } from './types'

const withinTimeScale = (newValues: Moment[], timescale: Timescale) => {
  const domain = timescale.domain().map((value) => moment(value))

  if (newValues.length === 0) {
    return true
  } else if (newValues.length === 1) {
    return domain[0] < newValues[0] && newValues[0] < domain[1]
  } else if (newValues.length === 2) {
    return domain[0] < newValues[0] && newValues[1] < domain[1]
  } else {
    console.debug('selectionRange can have a maximum of two elements.')
    return false
  }
}

export const useSelectionRange = (
  defaultValues: Moment[],
  timescale: Timescale
): [Moment[], (newValue: Moment[]) => void] => {
  const [values, setValues] = useState<Moment[]>(defaultValues)
  const setSelectionRange = (newValues: Moment[]) => {
    if (withinTimeScale(newValues, timescale)) {
      setValues(newValues)
    }
  }

  return [values, setSelectionRange]
}
