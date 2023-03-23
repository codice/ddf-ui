import React from 'react'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { SortType } from '../../js/model/Query.shared-types'
import { FilterBuilderClass } from '../filter-builder/filter.structure'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import { TypedMetacardDefs } from '../tabs/metacard/metacardDefinitions'
import { TypedProperties } from './TypedProperties'

import userInstance from './user-instance'

export const TypedUserInstance = {
  getUserInstance: () => {
    return userInstance
  },
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
    const currentAttributesShown =
      TypedUserInstance.getResultsAttributesShownTable()
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
    const currentAttributesShown =
      TypedUserInstance.getResultsAttributesShownList()
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
  getQuerySettingsJSON: (): QuerySettingsType => {
    return TypedUserInstance.getQuerySettingsModel().toJSON()
  },
  getQuerySettingsModel: (): QuerySettingsModelType => {
    return userInstance.getQuerySettings()
  },
  updateQuerySettings: (newSettings: Partial<QuerySettingsType>): void => {
    const currentSettings = TypedUserInstance.getQuerySettingsModel()
    currentSettings.set(newSettings)
    userInstance.savePreferences()
  },
  getCoordinateFormat: (): string => {
    let coordFormat = userInstance
      .get('user')
      ?.get('preferences')
      ?.get('coordinateFormat')

    if (!coordFormat) {
      const defaultCoordFormat = userInstance
        .get('user')
        ?.defaults()
        ?.preferences?.get('coordinateFormat')
      coordFormat = defaultCoordFormat ?? 'degrees'
    }

    return coordFormat
  },
  getEphemeralSorts(): undefined | SortType[] {
    return userInstance.get('user').get('preferences').get('resultSort')
  },
  getEphemeralFilter(): undefined | FilterBuilderClass {
    return userInstance.get('user').get('preferences').get('resultFilter')
  },
  removeEphemeralFilter() {
    userInstance.get('user').get('preferences').set('resultFilter', undefined)
    TypedUserInstance.savePreferences()
  },
  getPreferences(): Backbone.Model<any> {
    return userInstance.get('user').get('preferences')
  },
  savePreferences() {
    userInstance.get('user').get('preferences').savePreferences()
  },
  getActingRole: (): string => {
    return userInstance.get('user').get('preferences').get('actingRole')
  },
  setActingRole: (actingRole: string) => {
    return userInstance
      .get('user')
      .get('preferences')
      .set('actingRole', actingRole)
  },
  canWrite: (result: LazyQueryResult): boolean => {
    return userInstance.canWrite(result.plain.metacard.properties)
  },
  getResultCount: (): number => {
    return userInstance.get('user').get('preferences').get('resultCount')
  },
  getUserReadableDateTime: (val: any): string => {
    return userInstance.getUserReadableDateTime(val)
  },
  getMapHome: () => {
    return TypedUserInstance.getPreferences().get('mapHome')
  },
}

export function useActingRole<T extends string>(): T {
  const [activeRole, setActiveRole] = React.useState(
    TypedUserInstance.getActingRole() as T
  )
  useListenTo(TypedUserInstance.getPreferences(), 'change:actingRole', () => {
    setActiveRole(TypedUserInstance.getActingRole() as T)
  })
  return activeRole
}

export const useEphemeralFilter = () => {
  const [ephemeralFilter, setEphemeralFilter] = React.useState(
    TypedUserInstance.getEphemeralFilter()
  )
  useListenTo(TypedUserInstance.getPreferences(), 'change:resultFilter', () => {
    setEphemeralFilter(TypedUserInstance.getEphemeralFilter())
  })
  return ephemeralFilter
}

type QuerySettingsType = {
  type: string
  sources: string[]
  federation: 'selected' | 'enterprise'
  sorts: { attribute: string; direction: 'descending' | 'ascending' }[]
  template: string
  spellcheck: boolean
  phonetics: boolean
}

type QuerySettingsModelType = {
  get: (attr: string) => any
  set: (attr: any, value?: any) => void
  toJSON: () => QuerySettingsType
}
