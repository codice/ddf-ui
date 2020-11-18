import { TypedMetacardDefs } from '../tabs/metacard/metacardDefinitions'
import { TypedProperties } from './TypedProperties'

const userInstance = require('./user-instance')

export const TypedUserInstance = {
  getResultsAttributesShown: (): string[] => {
    const userchoices = userInstance
      .get('user')
      .get('preferences')
      .get('results-attributesShown')
    if (userchoices.length > 0) {
      return userchoices
    }
    if (TypedProperties.getResultsAttributeShown().length > 0) {
      return TypedProperties.getResultsAttributeShown()
    }
    return ['title', 'thumbnail']
  },
  // basically, what could be shown that currently isn't
  getResultsAttributesPossible: (): string[] => {
    const currentAttributesShown = TypedUserInstance.getResultsAttributesShown()
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
