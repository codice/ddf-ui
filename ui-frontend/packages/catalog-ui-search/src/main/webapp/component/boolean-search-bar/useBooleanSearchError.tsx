/* Copyright (c) Connexta, LLC */
import * as React from 'react'
import { useState, useEffect } from 'react'
import { BooleanTextType } from '../filter-builder/filter.structure'

const ERROR_MESSAGES = {
  punctuation: (
    <div>
      Invalid Query:
      <div>
        If using characters outside the alphabet (a-z), make sure to quote them
        like so ("big.doc" or "bill's car").
      </div>
    </div>
  ),
  syntax: (
    <div>
      Invalid Query:
      <div>Check that syntax of AND / OR / NOT is used correctly.</div>
    </div>
  ),
  both: (
    <div>
      Invalid Query:
      <div>
        If using characters outside the alphabet (a-z), make sure to quote them
        like so ("big.doc" or "bill's car").
      </div>
      <div>Check that syntax of AND / OR / NOT is used correctly.</div>
    </div>
  ),
}

const useBooleanSearchError = (value: BooleanTextType) => {
  const [errorMessage, setErrorMessage] = useState(ERROR_MESSAGES.both)

  useEffect(() => {
    if (value.error) {
      setErrorMessage(ERROR_MESSAGES.syntax)
    }
  }, [value])

  return { errorMessage }
}

export default useBooleanSearchError
