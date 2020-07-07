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
import metacardDefinitions from '../../component/singletons/metacard-definitions.js'

import * as React from 'react'

import styled from 'styled-components'
import FilterAttribute from './filter-attribute'
import FilterComparator from './filter-comparator'
import FilterInput from './filter-input'
import { getAttributeType, getFilteredAttributeList } from './filterHelper'
const sources = require('../../component/singletons/sources-instance')
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Autocomplete from '@material-ui/lab/Autocomplete'

import { hot } from 'react-hot-loader'
import TextField from '@material-ui/core/TextField'

class Filter extends React.Component {
  constructor(props) {
    super(props)
    const comparator = props.comparator || 'CONTAINS'
    let attribute = props.attribute || 'anyText'
    if (
      props.includedAttributes &&
      !props.includedAttributes.includes(attribute)
    ) {
      attribute = props.includedAttributes[0]
    }

    this.state = {
      comparator,
      attribute,
      suggestions: props.suggestions || [],
      value: props.value !== undefined ? props.value : '',
    }
    props.onChange(this.state)
  }

  componentDidMount() {
    this.updateSuggestions()
  }

  render() {
    const attributeList = getFilteredAttributeList()
    const currentSelectedAttribute = attributeList.find(
      attrInfo => attrInfo.value === this.state.attribute
    )
    return (
      <Grid container direction="column" alignItems="center" className="w-full">
        <Grid item className="w-full pb-2">
          <Autocomplete
            fullWidth
            options={attributeList}
            getOptionLabel={option => option.label}
            getOptionSelected={option => option.value}
            onChange={(e, newValue) => {
              this.updateAttribute(newValue.value)
            }}
            disableClearable
            value={currentSelectedAttribute}
            renderInput={params => <TextField {...params} variant="outlined" />}
          />
        </Grid>
        <Grid item className="w-full pb-2">
          <FilterComparator
            comparator={this.state.comparator}
            editing={this.props.editing}
            attribute={this.state.attribute}
            onChange={comparator =>
              this.setState({ comparator }, this.onChange)
            }
          />
        </Grid>
        <Grid item className="w-full pb-2">
          <FilterInput
            suggestions={this.state.suggestions}
            attribute={this.state.attribute}
            comparator={this.state.comparator}
            editing={this.props.editing}
            onChange={value => {
              this.setState({ value }, () => this.props.onChange(this.state))
            }}
            value={this.state.value}
          />
        </Grid>
      </Grid>
    )
  }

  onChange = () => {
    this.updateSuggestions()
    this.props.onChange(this.state)
  }
  getListofSupportedAttributes = () => {
    // if no source is selected and supportedAttributes is present from parent component we want to present all attributes as available
    const supportedAttributes = this.props.supportedAttributes
    // if supportedAttributes is not passed down from another parent Component (other than advanced) return empty list
    if (!supportedAttributes || supportedAttributes.length == 0) {
      return []
    }
    return sources.models
      .filter(source => supportedAttributes.includes(source.id))
      .map(
        sourceSelected =>
          sourceSelected.attributes.supportedAttributes
            ? sourceSelected.attributes.supportedAttributes
            : []
      )
      .flat()
  }
  updateSuggestions = async () => {
    const { attribute } = this.state
    let suggestions = []
    if (metacardDefinitions.enums[attribute]) {
      suggestions = metacardDefinitions.enums[attribute].map(suggestion => {
        return { label: suggestion, value: suggestion }
      })
    } else if (this.props.suggester) {
      suggestions = (await this.props.suggester(
        metacardDefinitions.metacardTypes[attribute]
      )).map(suggestion => ({
        label: suggestion,
        value: suggestion,
      }))
    }

    suggestions.sort((a, b) =>
      a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    )

    this.setState({ suggestions })
  }

  updateAttribute = attribute => {
    const prevType = getAttributeType(this.state.attribute)
    const newType = getAttributeType(attribute)
    let value = this.state.value
    if (prevType !== newType) {
      value = ''
    }
    this.setState({ attribute, value }, this.onChange)
  }
}

export default hot(module)(Filter)
