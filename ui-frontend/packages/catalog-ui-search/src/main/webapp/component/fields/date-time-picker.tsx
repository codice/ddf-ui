import * as React from 'react'
import { IDateInputProps } from '@blueprintjs/datetime'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { DateField } from './date'
import CalendarIcon from '@mui/icons-material/Event'
import ClearIcon from '@mui/icons-material/Clear'
import { hot } from 'react-hot-loader'
import InputAdornment from '@mui/material/InputAdornment'

type DateFieldProps = {
  value: string | null
  onChange: (value: string | null) => void
  isNullable?: boolean
  TextFieldProps?: Partial<TextFieldProps>
  /**
   * Override if you absolutely must.
   * Take extra caution when overriding minDate and maxDate.
   * Overriding minDate and maxDate will work as a visual overlay which can only be used
   * to restrict which dates a user can input- but can't be used to give the users a lower/higher
   * min or max. The true min/max is set in dateHelpers. We should probably update this at some
   * point to be passed down by this component.
   */
  BPDateProps?: Partial<IDateInputProps>
}

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
  isNullable,
  TextFieldProps,
  BPDateProps,
}: DateFieldProps) => {
  const inputRef = React.useRef<HTMLDivElement>(null)
  /**
   * We want to avoid causing the TextField below to percieve a change to inputComponent when possible, because that mucks with focus.
   *
   * We stringify the BPDateProps to make life easier for devs, since they will likely pass a plain object.  If they do and their component rerenders,
   * this memo would trigger even though they think they didn't change BPDateProps (the object is different though!).  So we stringify to make sure we
   * only pick up real changes.
   */
  const inputComponent = React.useMemo(() => {
    let classes = 'px-[14px] py-[8.5px]'

    return React.forwardRef((props: any, ref: any) => {
      return (
        <DateField
          {...props}
          isNullable
          BPDateProps={{
            ...BPDateProps,
            className: classes,
            inputProps: {
              inputRef: ref,
            },
          }}
        />
      )
    })
  }, [JSON.stringify(BPDateProps)])

  return (
    <TextField
      fullWidth
      variant={TextFieldProps?.variant}
      label="Date"
      InputLabelProps={{ shrink: true }}
      value={value}
      onChange={onChange as any}
      ref={inputRef}
      InputProps={{
        inputComponent: inputComponent,
        endAdornment: (
          <InputAdornment
            component="button"
            type="button"
            className="cursor-pointer"
            position="end"
            onClick={() => {
              if (inputRef.current) {
                inputRef.current.querySelector('input')?.focus()
              }
            }}
          >
            {isNullable && (
              <ClearIcon
                className={`${value ? '' : 'hidden'}`}
                onClick={(e) => {
                  onChange(null)
                  e.stopPropagation()
                }}
              />
            )}
            <CalendarIcon />
          </InputAdornment>
        ),
      }}
      {...TextFieldProps}
    />
  )
}

export default hot(module)(DateTimePicker)
