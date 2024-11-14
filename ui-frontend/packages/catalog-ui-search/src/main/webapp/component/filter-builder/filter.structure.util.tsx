import { FilterClass, ValueType, ValueTypes } from './filter.structure'

export const isRelativeValue = (
  value: ValueType
): value is ValueTypes['relative'] => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'last' in value &&
    'unit' in value &&
    typeof value.last === 'string' &&
    ['m', 'h', 'd', 'M', 'y', 's', 'w'].includes(value.unit)
  )
}

export const isAroundValue = (
  value: ValueType
): value is ValueTypes['around'] => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'date' in value &&
    'buffer' in value &&
    'direction' in value &&
    typeof value.date === 'string' &&
    typeof value.buffer === 'object' &&
    'amount' in value.buffer &&
    'unit' in value.buffer &&
    typeof value.buffer.amount === 'string' &&
    ['both', 'before', 'after'].includes(value.direction)
  )
}

export const isProximityValue = (
  value: ValueType
): value is ValueTypes['proximity'] => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'first' in value &&
    'second' in value &&
    'distance' in value &&
    typeof value.first === 'string' &&
    typeof value.second === 'string' &&
    typeof value.distance === 'number'
  )
}

export const isDateValue = (value: ValueType): value is ValueTypes['date'] => {
  return typeof value === 'string'
}

export const isBooleanValue = (
  value: ValueType
): value is ValueTypes['boolean'] => {
  return typeof value === 'boolean'
}

export const isTextValue = (value: ValueType): value is ValueTypes['text'] => {
  return typeof value === 'string'
}

export const isFloatValue = (
  value: ValueType
): value is ValueTypes['float'] => {
  return typeof value === 'number'
}

export const isIntegerValue = (
  value: ValueType
): value is ValueTypes['integer'] => {
  return Number.isInteger(value)
}

export const isDuringValue = (
  value: ValueType
): value is ValueTypes['during'] => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'start' in value &&
    'end' in value &&
    typeof value.start === 'string' &&
    typeof value.end === 'string'
  )
}

export const isBetweenValue = (
  value: ValueType
): value is ValueTypes['between'] => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'start' in value &&
    'end' in value &&
    Number.isInteger(value.start) &&
    Number.isInteger(value.end)
  )
}

export const isMultivalue = (
  value: ValueType
): value is ValueTypes['multivalue'] => {
  return Array.isArray(value) && value.every((v) => typeof v === 'string')
}

export const isBooleanTextValue = (
  value: ValueType
): value is ValueTypes['booleanText'] => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    'cql' in value &&
    'error' in value &&
    typeof value.text === 'string' &&
    typeof value.cql === 'string' &&
    typeof value.error === 'boolean'
  )
}

export const isLocationValue = (
  value: ValueType
): value is ValueTypes['location'] => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    (value.type === 'LINE' ||
      value.type === 'POLYGON' ||
      value.type === 'POINTRADIUS')
  )
}

export const isValueEmpty = (filter: FilterClass): boolean => {
  const type = filter.type
  if (type === 'IS NULL') {
    return false // IS NULL is never empty
  }

  const value = filter.value
  if (value === null || value === undefined || value === '') {
    return true
  }

  if (isDateValue(value)) {
    return value.trim() === ''
  }

  if (isBooleanValue(value)) {
    return false // Boolean values can't be "empty"
  }

  if (isTextValue(value)) {
    return value.trim() === ''
  }

  if (isFloatValue(value)) {
    return isNaN(value)
  }

  if (isIntegerValue(value)) {
    return isNaN(value)
  }

  if (isDuringValue(value)) {
    return value.start.trim() === '' || value.end.trim() === ''
  }

  if (isBetweenValue(value)) {
    return isNaN(value.start) || isNaN(value.end)
  }

  if (isMultivalue(value)) {
    return value.length === 0 || value.every((v) => v.trim() === '')
  }

  if (isBooleanTextValue(value)) {
    return value.text.trim() === '' || value.cql.trim() === ''
  }

  if (isLocationValue(value)) {
    if (value.type === 'LINE') {
      return value.line.length === 0
    } else if (value.type === 'POLYGON') {
      return value.polygon.length === 0
    } else if (value.type === 'POINTRADIUS') {
      return (
        isNaN(value.lat) ||
        isNaN(value.lon) ||
        isNaN(parseFloat(value.radius.toString()))
      )
    }
  }

  if (isProximityValue(value)) {
    return (
      value.first.trim() === '' ||
      value.second.trim() === '' ||
      isNaN(value.distance)
    )
  }

  if (isAroundValue(value)) {
    return (
      value.date.trim() === '' ||
      isNaN(parseFloat(value.buffer.amount)) ||
      parseFloat(value.buffer.amount) <= 0
    )
  }

  if (isRelativeValue(value)) {
    return (
      value.last.trim() === '' ||
      isNaN(parseFloat(value.last)) ||
      parseFloat(value.last) <= 0
    )
  }

  return false
}
