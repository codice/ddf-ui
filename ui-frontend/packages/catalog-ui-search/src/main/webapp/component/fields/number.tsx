import * as React from 'react'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { EnterKeySubmitProps } from '../custom-events/enter-key-submit'

type LocalValueType = number | '' | '-'

type Props = {
  value?: string
  onChange?: (val: number) => void
  type: 'integer' | 'float'
  TextFieldProps?: TextFieldProps
  validation?: (val: number) => boolean
  validationText?: string
}

const defaultValue = 1

function parseValue(value: string, type: Props['type']) {
  let parsedValue = defaultValue
  if (type === 'integer') {
    parsedValue = parseInt(value)
  } else {
    parsedValue = parseFloat(value)
  }
  if (isNaN(parsedValue)) {
    return defaultValue
  } else {
    return parsedValue
  }
}

function useLocalValue({
  value,
  onChange,
  type,
  validation = () => true,
  validationText = 'Must be a valid number, using previous value of ',
}: Props) {
  const [localValue, setLocalValue] = React.useState<LocalValueType>(
    parseValue(value || '1', type)
  )
  const [hasValidationIssues, setHasValidationIssues] = React.useState(false)
  const [constructedValidationText, setConstructedValidationText] =
    React.useState('')

  React.useEffect(() => {
    if (
      onChange &&
      typeof localValue === 'number' &&
      !isNaN(localValue) &&
      validation(localValue)
    ) {
      setHasValidationIssues(false)
      onChange(localValue)
    } else {
      setConstructedValidationText(validationText + value)
      setHasValidationIssues(true)
    }
  }, [localValue, value])
  return {
    localValue,
    setLocalValue,
    hasValidationIssues,
    constructedValidationText,
  }
}

export const NumberField = ({
  value,
  onChange,
  type,
  validation,
  validationText,
  TextFieldProps,
}: Props) => {
  const {
    localValue,
    setLocalValue,
    hasValidationIssues,
    constructedValidationText,
  } = useLocalValue({ value, onChange, type, validation, validationText })
  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      value={localValue}
      type="number"
      onChange={(e) => {
        if (onChange) {
          const inputValue = e.target.value
          if (inputValue === '' || inputValue === '-') {
            setLocalValue(inputValue)
          } else if (type === 'integer') {
            setLocalValue(parseInt(inputValue))
          } else {
            setLocalValue(parseFloat(inputValue))
          }
        }
      }}
      helperText={hasValidationIssues ? constructedValidationText : ''}
      FormHelperTextProps={{
        error: true,
      }}
      {...TextFieldProps}
      {...EnterKeySubmitProps}
    />
  )
}
