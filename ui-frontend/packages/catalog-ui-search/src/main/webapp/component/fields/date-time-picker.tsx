import * as React from 'react'
import { useState, useRef } from 'react'
import {
  DatePicker,
  IDateInputProps,
  IDatePickerProps,
} from '@blueprintjs/datetime'
import { DateHelpers } from './date-helpers'
import { MuiOutlinedInputBorderClasses } from '../theme/theme'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import CalendarIcon from '@material-ui/icons/Event'
import Popover from '@material-ui/core/Popover'
import useTimePrefs from './useTimePrefs'

type DateFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: TextFieldProps['disabled']
  variant?: TextFieldProps['variant']
  error?: TextFieldProps['error']
  helperText?: TextFieldProps['helperText']
  label?: TextFieldProps['label']
  disableShortcuts?: boolean
  margin?: TextFieldProps['margin']
  style?: React.CSSProperties
  /**
   * Override if you absolutely must
   */
  BPDateProps?: IDatePickerProps
}

const validateShape = ({ value, onChange }: DateFieldProps) => {
  if (DateHelpers.Blueprint.commonProps.parseDate(value) === null) {
    onChange(new Date().toISOString())
  }
}

const formatInputValue = (value: string) => {
  if (value) {
    const date = DateHelpers.Blueprint.commonProps.parseDate(value)
    return DateHelpers.Blueprint.commonProps.formatDate(date!)
  } else {
    return '' // This allows us to display an empty state without label overlap
  }
}

/**
 * DateTimePicker that combines Mui TextField with BlueprintJs DatePicker
 * @displayValue - the display text that is shown by the TextField. Anytime a valid date is input into the TextField, the value is updated
 * @value - the value that holds the date. Often converted into a "TimeShiftedIso" to deal with the fact that Dates don't hold timezone data
 * @isInternalChange - determines whether the updated value came from inside or outside the component
 */
const DateTimePicker = ({
  value,
  onChange,
  disabled,
  variant,
  error,
  helperText,
  label,
  disableShortcuts,
  margin,
  style,
  BPDateProps,
}: DateFieldProps) => {
  useTimePrefs()
  const [displayValue, setDisplayValue] = useState(formatInputValue(value))
  const [isInternalChange, setIsInternalChange] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const dateIconRef = useRef<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    validateShape({ onChange, value })
  }, [])

  React.useEffect(() => {
    if (isInternalChange) {
      setIsInternalChange(false)
    } else {
      // If the value is updated externally (i.e. a new value is passed into the component),
      // then we need to update the display value.
      // This allows us to keep the displayValue and value separate
      // and type in the TextField without being hijacked
      setDisplayValue(formatInputValue(value))
    }
  }, [value])

  const generateOnChange = (onChange: (value: string) => void) => {
    return ((selectedDate, isUserChange) => {
      if (onChange && selectedDate && isUserChange) {
        setIsInternalChange(true)
        setDisplayValue(
          DateHelpers.Blueprint.commonProps.formatDate(selectedDate)
        )
        onChange(
          DateHelpers.Blueprint.converters.TimeshiftedDateToISO(selectedDate)
        )
      }
    }) as IDateInputProps['onChange']
  }

  const dateIsValid = (value: string) => {
    const generatedDate = DateHelpers.Blueprint.DateProps.generateValue(value)
    return DateHelpers.Blueprint.commonProps.isValid(generatedDate)
  }

  return (
    <>
      <TextField
        onChange={(e) => {
          setDisplayValue(e.target.value)
          if (dateIsValid(e.target.value)) {
            onChange(e.target.value)
            setIsInternalChange(true)
          }
        }}
        onClick={() => setAnchorEl(dateIconRef.current)}
        disabled={disabled}
        label={label || 'Date'}
        margin={margin}
        value={displayValue}
        variant={variant}
        style={style}
        error={error}
        helperText={helperText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                ref={dateIconRef}
                disabled={disabled}
                onClick={() => setAnchorEl(dateIconRef.current)}
              >
                <CalendarIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        disableAutoFocus={true}
        disableEnforceFocus={true}
      >
        <DatePicker
          key="picker"
          className={MuiOutlinedInputBorderClasses}
          onChange={generateOnChange(onChange)}
          shortcuts={!disableShortcuts}
          timePrecision="minute"
          // @ts-ignore this allows an empty picker
          value={
            value === undefined
              ? value
              : DateHelpers.Blueprint.DateProps.generateValue(value)
          }
          {...BPDateProps}
        />
      </Popover>
    </>
  )
}

export default DateTimePicker
