import React, { useCallback, useEffect, useState } from 'react'
import _debounce from 'lodash/debounce'
import { Suggestion } from '../location/gazetteer'
import Autocomplete from '@material-ui/lab/Autocomplete'
import CircularProgress from '@material-ui/core/CircularProgress'
import TextField, { TextFieldProps } from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Chip from '@material-ui/core/Chip'
import RoomIcon from '@material-ui/icons/Room'
import DeleteIcon from '@material-ui/icons/Clear'

type Props = {
  suggester: (input: string) => Promise<Suggestion[]>
  onChange: (suggestion?: Suggestion) => Promise<void>
  debounce?: number
  minimumInputLength?: number
  onError?: any
  value: any
  placeholder?: string
  variant?: TextFieldProps['variant']
}

const GazetteerAutoComplete = ({
  suggester,
  debounce = 350,
  minimumInputLength = 3,
  onError,
  value,
  ...props
}: Props) => {
  const [selected, setSelected] = React.useState(value)
  const [input, setInput] = useState(value)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestionsFunc = async (input: string) => {
    if (!(input.length < minimumInputLength)) {
      try {
        const suggestions = await suggester(input)
        setSuggestions(suggestions)
        setLoading(false)
      } catch (e) {
        setLoading(false)
        setError('Endpoint unavailable')
        if (typeof onError === 'function') onError(e)
      }
    } else {
      setLoading(false)
    }
  }

  const fetchSuggestions = useCallback(
    _debounce(fetchSuggestionsFunc, debounce),
    []
  )

  useEffect(() => {
    fetchSuggestions(input)
  }, [input])

  const onChange = (input: string) => {
    setInput(input)
    setLoading(true)
    setSuggestions([])
    setError(null)
  }

  const onValueSelect = (
    _event: React.ChangeEvent<HTMLInputElement>,
    suggestion: Suggestion
  ) => {
    if (suggestion) {
      props.onChange(suggestion)
    } else {
      setInput('')
    }
  }

  const placeholder =
    input.length < minimumInputLength
      ? `Please enter ${minimumInputLength} or more characters`
      : undefined

  const getNoOptionsText = () => {
    if (!input) {
      return 'Start typing to see suggestions'
    } else if (input.length < minimumInputLength) {
      const charactersToType = minimumInputLength - input.length
      const pluralCharacter = charactersToType === 1 ? '' : 's'
      return `Type ${charactersToType} more character${pluralCharacter} to see suggestions`
    } else {
      return error || 'No results found'
    }
  }
  React.useEffect(() => {
    setSelected(Boolean(value))
  }, [value])

  if (selected) {
    return (
      <Chip
        className="w-full px-2 justify-start rounded"
        style={{ height: '42px' }}
        avatar={<RoomIcon />}
        label={
          <div className="flex flex-row flex-no-wrap items-center">
            <div className="flex-shrink w-full truncate">{value}</div>
            <Button
              color="primary"
              className="flex-shrink-0"
              onClick={() => {
                props.onChange(undefined)
              }}
            >
              <DeleteIcon />
            </Button>
          </div>
        }
        variant="outlined"
      />
    )
  }

  return (
    <Autocomplete
      data-id="autocomplete"
      getOptionLabel={(suggestion: Suggestion) => suggestion.name}
      options={suggestions}
      loading={loading}
      loadingText="Searching..."
      size="small"
      onChange={onValueSelect}
      onBlur={() => setInput('')}
      noOptionsText={getNoOptionsText()}
      autoHighlight
      renderInput={(params) => (
        <TextField
          {...params}
          variant={props.variant || 'outlined'}
          className="my-0"
          size="small"
          autoFocus
          value={input}
          placeholder={props.placeholder || placeholder}
          onChange={(e) => onChange(e.target.value)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}

export default GazetteerAutoComplete
