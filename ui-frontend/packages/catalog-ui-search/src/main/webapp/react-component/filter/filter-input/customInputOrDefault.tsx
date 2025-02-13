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
import extension from '../../../extension-points'
import TextField from '@mui/material/TextField'
import { TextFieldProps } from '@mui/material/TextField'
import { EnterKeySubmitProps } from '../../../component/custom-events/enter-key-submit'
import { BooleanTextType } from '../../../component/filter-builder/filter.structure'

type CustomInputOrDefaultType = {
  value: string
  onChange: (e: string) => void
  props?: Partial<TextFieldProps>
}

const validateShape = ({ value, onChange }: CustomInputOrDefaultType) => {
  if (typeof value !== 'string') {
    const booleanText = (value as BooleanTextType)?.text
    if (booleanText) {
      onChange(booleanText)
    } else {
      onChange('')
    }
  }
}

const ShapeValidator = (props: CustomInputOrDefaultType) => {
  const { value } = props
  const [isValid, setIsValid] = React.useState(false)
  React.useEffect(() => {
    if (typeof value !== 'string') {
      setIsValid(false)
      validateShape(props)
    } else {
      setIsValid(true)
    }
  }, [value])
  if (isValid) {
    return <CustomInputOrDefaultPostValidation {...props} />
  }
  return null
}

export const CustomInputOrDefaultPostValidation = ({
  value,
  onChange,
  props,
}: CustomInputOrDefaultType) => {
  let textValue = value
  //Clear out value when switching between structured string inputs (e.g. NEAR)
  if (typeof textValue !== 'string') {
    textValue = (value as any)?.text || ''
  }
  // call out to extension, if extension handles it, great, if not fallback to this
  const componentToReturn = extension.customFilterInput({
    value: textValue,
    onChange: onChange,
  })
  if (componentToReturn) {
    return componentToReturn as React.ReactNode
  } else {
    return (
      <TextField
        value={textValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          onChange(e.target.value)
        }}
        {...EnterKeySubmitProps}
        {...props}
      />
    )
  }
}

export const CustomInputOrDefault = ShapeValidator
