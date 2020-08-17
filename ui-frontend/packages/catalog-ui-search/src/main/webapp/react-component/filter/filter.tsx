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

import FilterComparator from './filter-comparator'
import FilterInput from './filter-input'
import { getAttributeType, getFilteredAttributeList } from './filterHelper'
import Grid from '@material-ui/core/Grid'
import Autocomplete from '@material-ui/lab/Autocomplete'

import { hot } from 'react-hot-loader'
import TextField from '@material-ui/core/TextField'
import { FilterClass } from '../../component/filter-builder/filter.structure'

type Props = {
  filter: FilterClass
  setFilter: (filter: FilterClass) => void
}

const Filter = ({ filter, setFilter }: Props) => {
  const { property } = filter
  const attributeList = getFilteredAttributeList()
  const currentSelectedAttribute = attributeList.find(
    attrInfo => attrInfo.value === property
  )
  return (
    <Grid container direction="column" alignItems="center" className="w-full">
      <Grid item className="w-full pb-2">
        <Autocomplete
          fullWidth
          size="small"
          options={attributeList}
          getOptionLabel={option => option.label}
          getOptionSelected={(option, value) => option.value === value.value}
          onChange={(e, newValue) => {
            const newProperty = newValue.value as FilterClass['property']
            setFilter({
              ...filter,
              property: newProperty,
            })
          }}
          disableClearable
          value={currentSelectedAttribute}
          renderInput={params => <TextField {...params} variant="outlined" />}
        />
      </Grid>
      <Grid item className="w-full pb-2">
        <FilterComparator filter={filter} setFilter={setFilter} />
      </Grid>
      <Grid item className="w-full">
        <FilterInput filter={filter} setFilter={setFilter} />
      </Grid>
    </Grid>
  )
}

// class Filter extends React.Component<Props, {}> {
//   constructor(props: Props) {
//     super(props)
//     const comparator = props.comparator || 'CONTAINS'
//     let attribute = props.attribute || 'anyText'
//     if (
//       props.includedAttributes &&
//       !props.includedAttributes.includes(attribute)
//     ) {
//       attribute = props.includedAttributes[0]
//     }

//     this.state = {
//       comparator,
//       attribute,
//       value: props.value !== undefined ? props.value : '',
//     }
//     props.onChange(this.state)
//   }

//   render() {
//     const attributeList = getFilteredAttributeList()
//     const currentSelectedAttribute = attributeList.find(
//       attrInfo => attrInfo.value === this.state.attribute
//     )
//     return (
//       <Grid container direction="column" alignItems="center" className="w-full">
//         <Grid item className="w-full pb-2">
//           <Autocomplete
//             fullWidth
//             options={attributeList}
//             getOptionLabel={option => option.label}
//             getOptionSelected={option => option.value}
//             onChange={(e, newValue) => {
//               this.updateAttribute(newValue.value)
//             }}
//             disableClearable
//             value={currentSelectedAttribute}
//             renderInput={params => <TextField {...params} variant="outlined" />}
//           />
//         </Grid>
//         <Grid item className="w-full pb-2">
//           <FilterComparator
//             comparator={this.state.comparator}
//             attribute={this.state.attribute}
//             onChange={comparator =>
//               this.setState({ comparator }, this.onChange)
//             }
//           />
//         </Grid>
//         <Grid item className="w-full pb-2">
//           <FilterInput
//             attribute={this.state.attribute}
//             comparator={this.state.comparator}
//             onChange={value => {
//               this.setState({ value }, () => this.props.onChange(this.state))
//             }}
//             value={this.state.value}
//           />
//         </Grid>
//       </Grid>
//     )
//   }

//   onChange = () => {
//     this.props.onChange(this.state)
//   }

//   updateAttribute = attribute => {
//     const prevType = getAttributeType(this.state.attribute)
//     const newType = getAttributeType(attribute)
//     let value = this.state.value
//     if (prevType !== newType) {
//       value = ''
//     }
//     this.setState({ attribute, value }, this.onChange)
//   }
// }

export default hot(module)(Filter)
