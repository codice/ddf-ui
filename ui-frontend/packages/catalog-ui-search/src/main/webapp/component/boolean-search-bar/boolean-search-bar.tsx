/* Copyright (c) Connexta, LLC */
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl, { FormControlProps } from '@mui/material/FormControl'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Autocomplete, {
  AutocompleteProps,
  createFilterOptions,
} from '@mui/material/Autocomplete'
import * as React from 'react'
import { hot } from 'react-hot-loader'
import { useState } from 'react'
import { BooleanTextType } from '../filter-builder/filter.structure'
import useBooleanSearchError from './useBooleanSearchError'
import ValidationIndicator from './validation-indicator'
import {
  fetchCql,
  fetchSuggestions,
  getRandomId,
  Option,
} from './boolean-search-utils'
import IconButton from '@mui/material/IconButton'
import { InputProps } from '@mui/material/Input'
import ClearIcon from '@mui/icons-material/Clear'
import SearchIcon from '@mui/icons-material/Search'
import { useUpdateEffect } from 'react-use'
import { dispatchEnterKeySubmitEvent } from '../custom-events/enter-key-submit'
import { useConfiguration } from '../../js/model/Startup/configuration.hooks'
const defaultFilterOptions = createFilterOptions()
type Props = {
  value: BooleanTextType
  onChange: (value: BooleanTextType) => void
  property?: string
  disableClearable?: boolean
  placeholder?: TextFieldProps['placeholder']
  FormControlProps?: FormControlProps
  TextFieldProps?: Partial<TextFieldProps>
  AutocompleteProps?: AutocompleteProps<Option, false, true, true>
  InputProps?: InputProps
}
const WILD_CARD = '*'
const defaultValue: BooleanTextType = {
  text: '',
  cql: '',
  error: false,
}
const validateShape = ({ value, onChange }: Props) => {
  if (
    value.text === undefined ||
    value.cql === undefined ||
    value.error === undefined
  ) {
    onChange(defaultValue)
  }
}
const ShapeValidator = (props: Props) => {
  React.useEffect(() => {
    validateShape(props)
  })
  if (props.value.text !== undefined) {
    return <BooleanSearchBar {...props} />
  }
  return null
}
/**
 * We want to take in a value, and onChange update it.  That would then flow a new value
 * back down.
 */
const BooleanSearchBar = ({
  value,
  onChange,
  property = 'anyText',
  placeholder,
  disableClearable,
  ...props
}: Props) => {
  const { config } = useConfiguration()
  if (placeholder === undefined) {
    placeholder = `Search ${config?.customBranding} ${config?.product}`
  }
  const [isOpen, setIsOpen] = React.useState(false)
  const { errorMessage } = useBooleanSearchError(value)
  const [loading, setLoading] = React.useState(false)
  const [suggestion, setSuggestion] = React.useState('')
  const [id] = React.useState(getRandomId())
  const [cursorLocation, setCursorLocation] = React.useState(0)
  const [tokens, setTokens] = React.useState<string[]>([])
  const inputRef = React.useRef<HTMLInputElement>()
  const optionToValue = (option: any) => option.token
  const [options, setOptions] = useState<Option[]>([])
  const isValidBeginningToken = (query: string) => {
    const trimmedToken = query.trim().toLowerCase()
    if (
      trimmedToken === 'not' ||
      trimmedToken === 'and' ||
      trimmedToken === 'or'
    ) {
      return false
    }
    return true
  }
  useUpdateEffect(() => {
    var controller = new AbortController()
    setLoading(true)
    // when empty, interpret as wildcard
    const searchVal = value.text === '' ? WILD_CARD : value.text
    if (searchVal && isValidBeginningToken(value.text)) {
      fetchCql({
        searchText: searchVal,
        searchProperty: property,
        callback: ({ cql = '', error, errorMessage }) => {
          onChange({
            ...value,
            cql,
            error: !!error,
            errorMessage,
          })
          setLoading(false)
        },
        signal: controller.signal,
      })
    } else {
      setLoading(false)
      onChange({
        ...value,
        cql: '',
        error: true,
      })
    }
    return () => {
      controller.abort()
    }
  }, [value.text, property])
  React.useEffect(() => {
    var controller = new AbortController()
    if (value.text !== null && isValidBeginningToken(value.text)) {
      fetchSuggestions({
        text: value.text,
        callback: ({ options }) => {
          setOptions(options)
        },
        signal: controller.signal,
      })
    } else {
      setOptions([])
    }
    return () => {
      controller.abort()
    }
  }, [value.text])
  React.useEffect(() => {
    const rawTokens = value.text.split(/[ ())]+/)
    let joinTokens = []
    for (let i = 0; i < rawTokens.length; i++) {
      joinTokens.push(rawTokens.slice(i, rawTokens.length).join(' ').trim())
    }
    setTokens(joinTokens)
  }, [value.text])
  const getOptionLabel = (option: any) => {
    if (!option || !option.token) return ''
    if (option.length === 0) return ''
    return option.token
  }
  const handleSubmit = (e: React.SyntheticEvent) => {
    if (!value.error && (!isOpen || currentOptions.length === 0)) {
      dispatchEnterKeySubmitEvent(e)
    }
  }
  // Used to determine what we can go for next in context the the previous.
  const filterOptions = React.useCallback(
    (optionsToFilter: any) => {
      const lastToken = tokens[tokens.length - 1]
      if (lastToken === undefined) {
        return []
      } else if (lastToken === '') {
        return optionsToFilter
      } else {
        const strippedOptions = optionsToFilter.map((o: any) => ({
          token: o.token,
        }))
        const filteredOptions = defaultFilterOptions(strippedOptions, {
          inputValue: lastToken,
          getOptionLabel,
        })
        const flatFilteredOptions = filteredOptions.map((o) => (o as any).token)
        const reconstructedOptions = optionsToFilter.filter((o: any) =>
          flatFilteredOptions.includes(o.token)
        )
        return reconstructedOptions
      }
    },
    [tokens]
  )
  React.useEffect(() => {
    if (value.text) {
      if (suggestion === 'AND' || suggestion === 'OR') {
        inputRef?.current?.setSelectionRange(cursorLocation, cursorLocation)
        setSuggestion('')
      }
    }
  }, [value.text])
  const handleTextChange = (e: any) => {
    onChange({
      ...value,
      text: e.target.value,
    })
  }
  const handleTextClear = () => {
    onChange({ ...defaultValue, text: '' })
  }
  const getLogicalOperators = (options: any) => {
    return options.filter((option: any) => option.type === 'logical')
  }
  const getTokenToRemove = (suggestion: Option) => {
    let tokenToRemove = ''
    for (let i = 0; i < tokens.length; i++) {
      const match = suggestion.token
        .toLowerCase()
        .match(tokens[i].toLowerCase())
      if (match && match[0]) {
        tokenToRemove = tokens[i]
        break
      }
    }
    return tokenToRemove
  }
  const currentOptions = filterOptions(getLogicalOperators(options)).sort(
    (o1: any) => (o1?.type === 'mandatory' ? -1 : 1)
  )
  return (
    <FormControl fullWidth {...props.FormControlProps}>
      <Autocomplete
        filterOptions={(optionsToFilter) => optionsToFilter}
        onOpen={() => {
          setIsOpen(true)
        }}
        open={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        options={currentOptions}
        includeInputInList={true}
        onChange={(_e: any, suggestion: any) => {
          if (
            suggestion &&
            suggestion.token &&
            suggestion.token !== value.text
          ) {
            let selectedSuggestion = optionToValue(suggestion).toUpperCase()
            if (selectedSuggestion === 'NOT') {
              selectedSuggestion = 'NOT ()'
            }
            setSuggestion(selectedSuggestion)
            const cursor = inputRef.current?.selectionStart
            const tokenToRemove = getTokenToRemove(suggestion)
            let newInputValue = value.text
            if (tokenToRemove !== '' && cursor && cursor < value.text.length) {
              const postText = value.text.substr(cursor, value.text.length)
              const preText = value.text.slice(
                0,
                (tokenToRemove.length + postText.length) * -1
              )
              onChange({
                ...value,
                text: `${preText}${selectedSuggestion}${postText}`,
              })
              const str = `${preText}${selectedSuggestion}`
              setCursorLocation(str.length)
            } else if (tokenToRemove !== '') {
              newInputValue = value.text.slice(0, tokenToRemove.length * -1)
            } else if (cursor && cursor < value.text.length) {
              const preText = value.text.substr(0, cursor).trim()
              const postText = value.text.substr(cursor, value.text.length)
              onChange({
                ...value,
                text: `${preText} ${selectedSuggestion}${postText}`,
              })
              const str = `${preText} ${selectedSuggestion}`
              setCursorLocation(str.length)
            }
            if (cursor && cursor >= value.text.length) {
              let newInput = `${newInputValue}${selectedSuggestion} `
              onChange({
                ...value,
                text: newInput,
              })
              setCursorLocation(newInput.length + 1)
            }
          }
        }}
        inputValue={value.text}
        getOptionLabel={getOptionLabel}
        multiple={false}
        disableClearable
        disableCloseOnSelect
        freeSolo
        id={id}
        renderOption={(option) => (
          <Typography noWrap>{optionToValue(option)}</Typography>
        )}
        renderInput={(params) => {
          return (
            <TextField
              data-id="search-input"
              {...params}
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e)
                  setIsOpen(false)
                }
              }}
              placeholder={placeholder}
              inputRef={inputRef}
              size={'small'}
              variant="outlined"
              onChange={handleTextChange}
              value={value.text}
              helperText={value.error ? <>{errorMessage}</> : ''}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    {loading ? (
                      <CircularProgress
                        size={20}
                        style={{ marginRight: 13, marginLeft: 2 }}
                      />
                    ) : (
                      <ValidationIndicator
                        helperMessage={value.error ? errorMessage : 'Valid'}
                        error={value.error}
                      />
                    )}
                  </>
                ),
                endAdornment: (
                  <>
                    {!disableClearable && !!value.text && (
                      <IconButton
                        onClick={handleTextClear}
                        style={{ padding: '2px' }}
                        size="large"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={(e) => {
                        setIsOpen(false)
                        handleSubmit(e)
                      }}
                      disabled={value.error}
                      style={{ padding: '2px' }}
                      size="large"
                    >
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </>
                ),

                ...props.InputProps,
              }}
              {...props.TextFieldProps}
            />
          )
        }}
        {...props.AutocompleteProps}
      />
    </FormControl>
  )
}
export default hot(module)(ShapeValidator)
