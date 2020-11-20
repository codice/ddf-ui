import { TypedMetacardDefs } from '../tabs/metacard/metacardDefinitions'
import { TypedProperties } from './TypedProperties'

const userInstance = require('./user-instance')

export const TypedUserInstance = {
  getResultsAttributesShownList: (): string[] => {
    const userchoices = userInstance
      .get('user')
      .get('preferences')
      .get('results-attributesShownList')
    if (userchoices.length > 0) {
      return userchoices
    }
    if (TypedProperties.getResultsAttributesShownList().length > 0) {
      return TypedProperties.getResultsAttributesShownList()
    }
    return ['title', 'thumbnail']
  },
  getResultsAttributesShownTable: (): string[] => {
    const userchoices = userInstance
      .get('user')
      .get('preferences')
      .get('results-attributesShownTable')
    if (userchoices.length > 0) {
      return userchoices
    }
    if (TypedProperties.getResultsAttributesShownTable().length > 0) {
      return TypedProperties.getResultsAttributesShownTable()
    }
    return ['title', 'thumbnail']
  },
  // basically, what could be shown that currently isn't
  getResultsAttributesPossibleTable: (): string[] => {
    const currentAttributesShown = TypedUserInstance.getResultsAttributesShownTable()
    const allKnownAttributes = TypedMetacardDefs.getSortedMetacardTypes()
    const searchOnlyAttributes = TypedMetacardDefs.getSearchOnlyAttributes()
    const attributesPossible = allKnownAttributes.filter((attr) => {
      return (
        !currentAttributesShown.includes(attr.id) &&
        !searchOnlyAttributes.includes(attr.id) &&
        !TypedMetacardDefs.isHiddenTypeExceptThumbnail({ attr: attr.id })
      )
    })
    return attributesPossible.map((attr) => attr.id)
  },
  // basically, what could be shown that currently isn't
  getResultsAttributesPossibleList: (): string[] => {
    const currentAttributesShown = TypedUserInstance.getResultsAttributesShownList()
    const allKnownAttributes = TypedMetacardDefs.getSortedMetacardTypes()
    const searchOnlyAttributes = TypedMetacardDefs.getSearchOnlyAttributes()
    const attributesPossible = allKnownAttributes.filter((attr) => {
      return (
        !currentAttributesShown.includes(attr.id) &&
        !searchOnlyAttributes.includes(attr.id) &&
        !TypedMetacardDefs.isHiddenTypeExceptThumbnail({ attr: attr.id })
      )
    })
    return attributesPossible.map((attr) => attr.id)
  },
}
