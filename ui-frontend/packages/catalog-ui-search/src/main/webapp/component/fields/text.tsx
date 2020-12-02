/**
 * Copyright (c) Codice Foundation
 *
 * This is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
 * General Public License as published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details. A copy of the GNU Lesser General Public License
 * is distributed along with this program and can be found at
 * <http://www.gnu.org/licenses/lgpl.html>.
 *
 **/
import * as React from 'react'

import MuiTextField, {
  TextFieldProps as MuiTextFieldProps,
} from '@material-ui/core/TextField'
import { ValueTypes } from '../filter-builder/filter.structure'
import CircularProgress from '@material-ui/core/CircularProgress'
import CloseIcon from '@material-ui/icons/Close'
import Button from '@material-ui/core/Button'
import OverflowTooltip from '../overflow-tooltip/overflow-tooltip'

/**
 * Use this to easily latch onto events for this input in ancestor components (pressing enter to search, etc.)
 */
export const FilterTextFieldIdentifier = `filter-text-filter-${Math.random()
  .toString()
  .replace('.', '')}`
const inputProps = {
  className: FilterTextFieldIdentifier,
}

type TextFieldProps = {
  value: ValueTypes['text']
  onChange: (val: ValueTypes['text']) => void
  TextFieldProps?: Partial<MuiTextFieldProps>
  SpellingSuggestionClassName?: string
}

const defaultValue = ''

const validateShape = ({ value, onChange }: TextFieldProps) => {
  if (typeof value !== 'string') {
    onChange(defaultValue)
  }
}

export const TextField = ({
  value,
  onChange,
  TextFieldProps,
  SpellingSuggestionClassName,
}: TextFieldProps) => {
  React.useEffect(() => {
    validateShape({ value, onChange })
  }, [])
  const [spellingSuggestion, setSpellingSuggestion] = React.useState(
    '' as string
  )
  const [checkingSpelling, setCheckingSpelling] = React.useState(false)
  React.useEffect(() => {
    let timeoutid = (undefined as unknown) as NodeJS.Timeout
    setSpellingSuggestion('')
    // should we filter out * and other types of weird values?
    // we could add a user preference check to this as well, so folks can disable it permanently
    if (value && value !== spellingSuggestion && value !== '*') {
      setCheckingSpelling(true)
      timeoutid = setTimeout(() => {
        // hit suggestion endpoint, precanned for now
        fetch('').then(() => {
          setCheckingSpelling(false)
          setSpellingSuggestion(value + 's') // fake suggestion until we get endpoint
        })
      }, 500)
    }
    return () => {
      setCheckingSpelling(false)
      clearTimeout(timeoutid)
    }
  }, [value])
  return (
    <>
      <MuiTextField
        fullWidth
        variant="outlined"
        placeholder="Use * for wildcard."
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        inputProps={inputProps}
        className="whitespace-normal"
        size="small"
        InputProps={{
          endAdornment: checkingSpelling ? (
            <CircularProgress style={{ width: '1rem', height: '1rem' }} />
          ) : null,
        }}
        {...TextFieldProps}
      />
      {spellingSuggestion ? (
        <>
          <div className={`ml-2 p-2 -mb-2 ${SpellingSuggestionClassName}`}>
            <div className="flex flex-row items-center flex-no-wrap">
              <div className="flex-shrink-0" style={{ width: '100px' }}>
                Did you mean{' '}
              </div>
              <OverflowTooltip>
                {({ refOfThingToMeasure }) => {
                  return (
                    <Button
                      onClick={() => {
                        onChange(spellingSuggestion)
                      }}
                      className="flex-shrink"
                      variant="text"
                      color="primary"
                      size="small"
                      title={spellingSuggestion}
                    >
                      <span ref={refOfThingToMeasure} className="truncate">
                        {spellingSuggestion}
                      </span>
                    </Button>
                  )
                }}
              </OverflowTooltip>
              <div>?</div>
              <Button
                onClick={() => {
                  setSpellingSuggestion('')
                }}
                variant="text"
                color="inherit"
                size="small"
              >
                <CloseIcon />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </>
  )
}
