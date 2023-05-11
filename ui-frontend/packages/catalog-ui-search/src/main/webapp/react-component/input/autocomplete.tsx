import * as React from 'react'
import clsx from 'clsx'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import CreateableSelect from 'react-select/creatable'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import AsyncCreateableSelect from 'react-select/async-creatable'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import AsyncSelect from 'react-select/async'
import { emphasize, useTheme } from '@mui/material/styles'
import makeStyles from '@mui/styles/makeStyles'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import CancelIcon from '@mui/icons-material/Cancel'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Props as CreatableProps } from 'react-select/src/Creatable'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { AsyncProps } from 'react-select/src/Async'
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Props as SelectProps } from 'react-select/src/Select'
import _debounce from 'lodash.debounce'

export type Option = {
  label: string
  value: any
}

export type GroupOptions = {
  label: string
  options: Option[]
}

const useStyles = makeStyles((theme: any) => ({
  input: {
    display: 'flex',
    padding: 0,
    height: 'auto',
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflowX: 'scroll',
    overflowY: 'hidden',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    scrollbarWidth: 'none',
  },
  chip: {
    margin: theme.spacing(0.5, 0.25),
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.mode === 'light'
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      0.08
    ),
  },
  noOptionsMessage: {
    padding: theme.spacing(1, 2),
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    bottom: 6,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing(2),
  },
}))

function NoOptionsMessage(props: any) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  )
}

function inputComponent({ inputRef, ...props }: any) {
  return <div ref={inputRef} {...props} />
}

function Control(props: any) {
  const {
    children,
    innerProps,
    innerRef,
    selectProps: { classes, TextFieldProps },
  } = props

  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: classes.input,
          ref: innerRef,
          children,
          ...innerProps,
        },
      }}
      {...TextFieldProps}
    />
  )
}

function Option(props: any) {
  return (
    <MenuItem
      ref={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  )
}

function Placeholder(props: any) {
  const { selectProps, innerProps = {}, children } = props
  return (
    <Typography
      color="textSecondary"
      className={selectProps.classes.placeholder}
      {...innerProps}
    >
      {children}
    </Typography>
  )
}

function SingleValue(props: any) {
  return (
    <Typography
      className={props.selectProps.classes.singleValue}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  )
}

function ValueContainer(props: any) {
  return (
    <div className={props.selectProps.classes.valueContainer}>
      {props.children}
    </div>
  )
}

function MultiValue(props: any) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={clsx(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  )
}

function Menu(props: any) {
  return (
    <Paper
      square
      className={props.selectProps.classes.paper}
      {...props.innerProps}
    >
      {props.children}
    </Paper>
  )
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
}

/**
 * Very important note when using async options: Because `onInputChange` for some reason is an 'interceptor' rather than a handler that ignores
 * the callback's return value (https://github.com/JedWatson/react-select/issues/1760), if you inline the method like
 * <CreatableSelect onInputChange={(value) => handleValue(value)}
 * and handleValue is an asynchronous function, it will attempt to alter the input value with the return value of handleValue, which will
 * immediately be a promise, causing CreatableSelect to throw an error (in my case `str.replace is not a function`)
 *
 * TLDR: You must not use the shorthand arrow syntax to auto return.
 * <CreatableSelect onInputChange={(value) => {handleValue(value)}} would work without issues.
 */
export const WrappedCreatableSelect = (props: CreatableProps<any>) => {
  const classes = useStyles()
  const theme = useTheme()
  const selectStyles = {
    input: (base: any) => ({
      ...base,
      color: theme.palette.text.primary,
      '& input': {
        font: 'inherit',
      },
      overflowX: 'scroll',
    }),
  }
  const { label, styles, ...baseProps } = props

  return (
    <CreateableSelect
      components={components}
      classes={classes}
      styles={selectStyles}
      TextFieldProps={{
        label,
        InputLabelProps: {
          htmlFor: 'react-select-multiple',
          shrink: true,
        },
      }}
      {...baseProps}
    />
  )
}

type AsyncCreateableProps = {
  /**
   * Time in ms to debounce load options call.
   */
  debounce?: number
} & CreatableProps<any> &
  AsyncProps<any>

export const WrappedAsyncCreatableSelect = (props: AsyncCreateableProps) => {
  const classes = useStyles()
  const theme = useTheme()
  const selectStyles = {
    input: (base: any) => ({
      ...base,
      color: theme.palette.text.primary,
      '& input': {
        font: 'inherit',
      },
    }),
  }
  const { label, styles, loadOptions, debounce = 0, ...baseProps } = props

  const debouncedLoadOptions = _debounce(loadOptions, debounce)

  return (
    <AsyncCreateableSelect
      loadOptions={debouncedLoadOptions}
      components={components}
      classes={classes}
      styles={{
        ...selectStyles,
      }}
      TextFieldProps={{
        label,
        InputLabelProps: {
          htmlFor: 'react-select-multiple',
          shrink: true,
        },
      }}
      {...baseProps}
    />
  )
}

type AsyncSelectProps = {
  /**
   * Time in ms to debounce load options call.
   */
  debounce?: number
} & SelectProps &
  AsyncProps<any>

export const WrappedAsyncSelect = (props: AsyncSelectProps) => {
  const classes = useStyles()
  const theme = useTheme()
  const selectStyles = {
    input: (base: any) => ({
      ...base,
      color: theme.palette.text.primary,
      '& input': {
        font: 'inherit',
      },
    }),
  }
  const {
    label,
    styles,
    debounce,
    loadOptions,
    components: customComponents,
    ...baseProps
  } = props

  const debouncedLoadOptions = _debounce(loadOptions, debounce)

  return (
    <AsyncSelect
      loadOptions={debouncedLoadOptions}
      components={{
        ...components,
        ...customComponents,
      }}
      classes={classes}
      styles={{
        ...selectStyles,
      }}
      TextFieldProps={{
        label,
        InputLabelProps: {
          htmlFor: 'react-select',
          shrink: true,
        },
      }}
      {...baseProps}
    />
  )
}
