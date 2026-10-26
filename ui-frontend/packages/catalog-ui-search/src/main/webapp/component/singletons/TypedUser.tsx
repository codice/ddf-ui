import React from 'react'
import { LazyQueryResult } from '../../js/model/LazyQueryResult/LazyQueryResult'
import { SortType } from '../../js/model/Query.shared-types'
import { FilterBuilderClass } from '../filter-builder/filter.structure'
import { useListenTo } from '../selection-checkbox/useBackbone.hook'
import moment from 'moment-timezone'

import userInstance from './user-instance'
import { StartupDataStore } from '../../js/model/Startup/startup'

export const TypedUserInstance = {
  getUserInstance: () => {
    return userInstance
  },
  getResultsAttributesSummaryShown: (): string[] => {
    const config = StartupDataStore.Configuration
    const required = config.getRequiredExportAttributes()

    const userchoices = userInstance
      .get('user')
      .get('preferences')
      .get('inspector-summaryShown')
    if (userchoices.length > 0) {
      return [...new Set([...userchoices, ...required])]
    }

    const summary = config.getSummaryShow()
    if (summary.length > 0 || required.length > 0) {
      return [...new Set([...summary, ...required])]
    }

    return ['title', 'created', 'thumbnail']
  },
  getResultsAttributesShownList: (): string[] => {
    const userchoices = userInstance
      .get('user')
      .get('preferences')
      .get('results-attributesShownList')
    if (userchoices.length > 0) {
      return userchoices
    }
    if (StartupDataStore.Configuration.getResultShow().length > 0) {
      return StartupDataStore.Configuration.getResultShow()
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
    if (StartupDataStore.Configuration.getDefaultTableColumns().length > 0) {
      return StartupDataStore.Configuration.getDefaultTableColumns()
    }
    return ['title', 'thumbnail']
  },
  // basically, what could be shown that currently isn't
  getResultsAttributesPossibleSummaryShown: (): string[] => {
    const currentAttributesShown =
      TypedUserInstance.getResultsAttributesSummaryShown()
    const allKnownAttributes =
      StartupDataStore.MetacardDefinitions.getSortedAttributes()
    const searchOnlyAttributes =
      StartupDataStore.MetacardDefinitions.getSearchOnlyAttributes()
    const attributesPossible = allKnownAttributes.filter((attr) => {
      return (
        !currentAttributesShown.includes(attr.id) &&
        !searchOnlyAttributes.includes(attr.id) &&
        !StartupDataStore.MetacardDefinitions.isHiddenAttribute(attr.id)
      )
    })
    return attributesPossible.map((attr) => attr.id)
  },
  getResultsAttributesPossibleTable: (
    currentAttributes?: string[]
  ): string[] => {
    const currentAttributesShown =
      currentAttributes ?? TypedUserInstance.getResultsAttributesShownTable()
    const allKnownAttributes =
      StartupDataStore.MetacardDefinitions.getSortedAttributes()
    const searchOnlyAttributes =
      StartupDataStore.MetacardDefinitions.getSearchOnlyAttributes()
    const attributesPossible = allKnownAttributes.filter((attr) => {
      return (
        !currentAttributesShown.includes(attr.id) &&
        !searchOnlyAttributes.includes(attr.id) &&
        !StartupDataStore.MetacardDefinitions.isHiddenAttribute(attr.id)
      )
    })
    return attributesPossible.map((attr) => attr.id)
  },
  // basically, what could be shown that currently isn't
  getResultsAttributesPossibleList: (
    currentAttributes?: string[]
  ): string[] => {
    const currentAttributesShown =
      currentAttributes ?? TypedUserInstance.getResultsAttributesShownList()
    const allKnownAttributes =
      StartupDataStore.MetacardDefinitions.getSortedAttributes()
    const searchOnlyAttributes =
      StartupDataStore.MetacardDefinitions.getSearchOnlyAttributes()
    const attributesPossible = allKnownAttributes.filter((attr) => {
      return (
        !currentAttributesShown.includes(attr.id) &&
        !searchOnlyAttributes.includes(attr.id) &&
        !StartupDataStore.MetacardDefinitions.isHiddenAttribute(attr.id)
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
  removeEphemeralSorts() {
    userInstance.get('user').get('preferences').set('resultSort', undefined)
    TypedUserInstance.savePreferences()
  },
  getPreferences(): Backbone.Model<any> & {
    needsUpdate: (update: any) => boolean
  } {
    return userInstance.get('user').get('preferences')
  },
  savePreferences() {
    userInstance.get('user').get('preferences').savePreferences()
  },
  canWrite: (result: LazyQueryResult): boolean => {
    return userInstance.canWrite(result.plain.metacard.properties)
  },
  isAdmin: (result: LazyQueryResult): boolean => {
    return userInstance.canShare(result.plain.metacard.properties)
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
  getDecimalPrecision: () => {
    return TypedUserInstance.getPreferences().get('decimalPrecision')
  },
  getMomentDate(date: string) {
    return `${moment(date).fromNow()} : ${userInstance.getUserReadableDateTime(
      date
    )}`
  },
  getMapLayers: (): Backbone.Collection => {
    const mapLayers = TypedUserInstance.getPreferences().get('mapLayers')
    return mapLayers
  },
  needsUpdate(upToDatePrefs: any) {
    return this.getPreferences().needsUpdate(upToDatePrefs)
  },
  sync(upToDatePrefs: any) {
    if (this.needsUpdate(upToDatePrefs)) {
      this.getPreferences().set(upToDatePrefs)
    }
  },
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
  additionalOptions?: string
}

type QuerySettingsModelType = {
  get: (attr: string) => any
  set: (attr: any, value?: any) => void
  toJSON: () => QuerySettingsType
}

export type TypedUserInstanceType = typeof TypedUserInstance
