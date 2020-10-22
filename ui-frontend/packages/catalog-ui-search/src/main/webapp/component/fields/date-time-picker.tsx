import * as React from 'react'
import { IDateInputProps } from '@blueprintjs/datetime'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import { DateField } from './date'
import CalendarIcon from '@material-ui/icons/Event'
import { hot } from 'react-hot-loader'
import InputAdornment from '@material-ui/core/InputAdornment'

type DateFieldProps = {
  value: string
  onChange: (value: string) => void
  TextFieldProps?: Partial<TextFieldProps>
  /**
   * Override if you absolutely must
   */
  BPDateProps?: Partial<IDateInputProps>
}

export const MuiInputClasses =
  'MuiOutlinedInput-root MuiOutlinedInput-inputMarginDense MuiOutlinedInput-notchedOutline'

export const MuiOutlinedInputClasses =
  'MuiOutlinedInput-root MuiOutlinedInput-multiline MuiOutlinedInput-inputMarginDense MuiOutlinedInput-notchedOutline'

/**
 * DateTimePicker that combines Mui TextField with BlueprintJs DatePicker
 *
 * For now it's meant to work with an outlined text field, but we can add support for other styles if we want.
 *
 * By changing the inputComponent, we avoid weird focusing issues, while still allowing use of all the other niceties (helperText) of TextField
 */
const DateTimePicker = ({
  value,
  onChange,
  TextFieldProps,
  BPDateProps,
}: DateFieldProps) => {
  /**
   * We want to avoid causing the TextField below to percieve a change to inputComponent when possible, because that mucks with focus.
   *
   * We stringify the BPDateProps to make life easier for devs, since they will likely pass a plain object.  If they do and their component rerenders,
   * this memo would trigger even though they think they didn't change BPDateProps (the object is different though!).  So we stringify to make sure we
   * only pick up real changes.
   */
  const inputComponent = React.useMemo(() => {
    let classes = MuiInputClasses

    if (TextFieldProps?.variant === 'outlined') {
      classes = MuiOutlinedInputClasses
    }

    return (props: any) => {
      return (
        <DateField
          {...props}
          BPDateProps={{
            ...BPDateProps,
            className: classes,
            inputProps: {
              inputRef: props.inputRef,
            },
          }}
        />
      )
    }
  }, [JSON.stringify(BPDateProps)])

  return (
    <TextField
      fullWidth
      variant={TextFieldProps?.variant}
      label="Date"
      InputLabelProps={{ shrink: true }}
      value={value}
      onChange={onChange as any}
      InputProps={{
        inputComponent: inputComponent,
        endAdornment: (
          <InputAdornment position="end">
            <CalendarIcon
              className={
                TextFieldProps?.variant === 'outlined' ? 'mr-1' : 'mr-4'
              }
            />
          </InputAdornment>
        ),
      }}
      {...TextFieldProps}
    />
  )
}

export default hot(module)(DateTimePicker)
