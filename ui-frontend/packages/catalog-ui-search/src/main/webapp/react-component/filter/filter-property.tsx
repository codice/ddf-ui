import * as React from 'react'
import { Attribute, getGroupedFilteredAttributes } from './filterHelper'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { FilterClass } from '../../component/filter-builder/filter.structure'
import { getComparators } from './filter-comparator/comparatorUtils'
import { Props, FilterContext } from './filter'

export const FilterProperty = ({ filter, setFilter }: Props) => {
  const { limitedAttributeList } = React.useContext(FilterContext)
  let attributeList = limitedAttributeList
  let groups = 1
  if (!attributeList) {
    const groupedFilteredAttributes = getGroupedFilteredAttributes()
    attributeList = groupedFilteredAttributes.attributes
    groups = groupedFilteredAttributes.groups.length
  }
  const { property } = filter
  const currentSelectedAttribute = attributeList.find(
    (attrInfo) => attrInfo.value === property
  )
  const groupBy = groups > 1 ? (option: Attribute) => option.group! : undefined
  return (
    <Autocomplete
      data-id="filter-type-autocomplete"
      fullWidth
      size="small"
      options={attributeList}
      groupBy={groupBy}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      onChange={(_e, newValue) => {
        /**
         * should update both the property and the type, since type is restricted based on property
         */
        const newProperty = newValue.value as FilterClass['property']
        const comparators = getComparators(newProperty)
        const updates = {
          property: newProperty,
          type: !comparators
            .map((comparator) => comparator.value)
            .includes(filter.type)
            ? (comparators[0].value as FilterClass['type'])
            : filter.type,
        }

        setFilter(
          new FilterClass({
            ...filter,
            ...updates,
          })
        )
      }}
      disableClearable
      value={currentSelectedAttribute}
      renderInput={(params) => <TextField {...params} variant="outlined" />}
    />
  )
}
