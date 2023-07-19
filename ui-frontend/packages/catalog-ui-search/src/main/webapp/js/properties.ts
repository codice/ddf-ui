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
const DEFAULT_AUTO_MERGE_TIME = 1000
import $ from 'jquery'
import _ from 'underscore'
import fetch from '../react-component/utils/fetch'
function match(regexList: any, attribute: any) {
  return (
    _.chain(regexList)
      .map((str) => new RegExp(str))
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '(regex: RegExp) => RegExpExecArr... Remove this comment to see the full error message
      .find((regex) => regex.exec(attribute))
      .value() !== undefined
  )
}
// these variables are defined during the build
/* global __COMMIT_HASH__, __IS_DIRTY__, __COMMIT_DATE__ */
const properties = {
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__COMMIT_HASH__'.
  commitHash: __COMMIT_HASH__,
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__IS_DIRTY__'.
  isDirty: __IS_DIRTY__,
  // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name '__COMMIT_DATE__'.
  commitDate: __COMMIT_DATE__,
  canvasThumbnailScaleFactor: 10,
  slidingAnimationDuration: 150,
  defaultFlytoHeight: 15000.0,
  CQL_DATE_FORMAT: 'YYYY-MM-DD[T]HH:mm:ss[Z]',
  ui: {},
  basicSearchTemporalSelectionDefault: [
    'created',
    'effective',
    'modified',
    'metacard.created',
    'metacard.modified',
  ],
  imageryProviders: [
    {
      type: 'SI',
      url: './images/natural_earth_50m.png',
      parameters: {
        imageSize: [10800, 5400],
      },
      alpha: 1,
      name: 'Default Layer',
      show: true,
      proxyEnabled: true,
      order: 0,
    },
  ],
  iconConfig: {},
  i18n: {
    'sources.unavailable':
      '{amountDown} {amountDown, plural, one {source is} other {sources are}} currently down',
    'sources.polling.error.title': 'Error Polling Sources',
    'search.sources.selected.none.message':
      'No sources are currently selected. Edit the search and select at least one source.',
    'sources.available': 'All sources are currently up',
    'sources.title': 'Sources',
    'sources.polling.error.message':
      'Unable to query server for list of active sources',
    'sources.options.all': 'All Sources',
    'form.title': 'title',
  },
  attributeAliases: {},
  commonAttributes: [],
  filters: {
    METADATA_CONTENT_TYPE: 'metadata-content-type',
    SOURCE_ID: 'source-id',
    GEO_FIELD_NAME: 'anyGeo',
    ANY_GEO: 'geometry',
    ANY_TEXT: 'anyText',
    OPERATIONS: {
      string: ['contains', 'matchcase', 'equals'],
      xml: ['contains', 'matchcase', 'equals'],
      date: ['before', 'after'],
      number: ['=', '>', '>=', '<', '<='],
      geometry: ['intersects'],
    },
    numberTypes: ['float', 'short', 'long', 'double', 'integer'],
  },
  sourcePollInterval: 60000,
  enums: {},
  extra: {},
  fetched: false,
  initializing: false,
  async init() {
    if (this.initializing) {
      return
    }
    this.initializing = true
    // use this function to initialize variables that rely on others
    let props = this

    await fetch('./internal/config')
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        props = _.extend(props, data)
      })
    await fetch('./internal/platform/config/ui')
      .then((res) => res.json())
      .then((data) => {
        props.ui = data
      })
    this.handleFeedback()
    this.handleExperimental()
    this.handleUpload()
    this.handleListTemplates()
    this.fetched = true
  },
  handleListTemplates() {
    try {
      ;(this as any).listTemplates = (this as any).listTemplates.map(JSON.parse)
    } catch (error) {
      /*
                        would be a good to start reporting errors like this to a log that can alert admins
                        or update the admin interface to include validation that prevents errors like this
                        ideally both
                    */
      ;(this as any).listTemplates = []
    }
  },
  handleFeedback() {
    $('html').toggleClass('is-feedback-restricted', this.isFeedbackRestricted())
  },
  handleExperimental() {
    $('html').toggleClass('is-experimental', this.hasExperimentalEnabled())
  },
  handleUpload() {
    $('html').toggleClass('is-upload-enabled', this.isUploadEnabled())
  },
  isHidden(attribute: any) {
    if (attribute === 'anyDate') {
      // feels like we should consolidate all the attribute logic into the metacard definitions file, but for now don't want to risk circular dependency
      return true
    }
    return match((this as any).hiddenAttributes, attribute)
  },
  isReadOnly(attribute: any) {
    return match(this.readOnly, attribute)
  },
  hasExperimentalEnabled() {
    return (this as any).isExperimental
  },
  getAutoMergeTime() {
    return (this as any).autoMergeTime || DEFAULT_AUTO_MERGE_TIME
  },
  isFeedbackRestricted() {
    return !(this as any).queryFeedbackEnabled
  },
  isDisableLocalCatalog() {
    return this.disableLocalCatalog
  },
  isHistoricalSearchEnabled() {
    return !this.isHistoricalSearchDisabled
  },
  isArchiveSearchEnabled() {
    return !this.isArchiveSearchDisabled
  },
  isUploadEnabled() {
    return (this as any).showIngest
  },
  isDevelopment() {
    return process.env.NODE_ENV !== 'production'
  },
  isSpellcheckEnabled() {
    return this.isSpellcheckEnabled
  },
  isPhoneticsEnabled() {
    return this.isPhoneticsEnabled
  },
  isFuzzyResultsEnabled() {
    return this.isFuzzyResultsEnabled
  },
  isMetacardPreviewEnabled() {
    return !this.isMetacardPreviewDisabled
  },
} as {
  fetched: boolean
  initializing: boolean
  init: () => Promise<void> | void
  [key: string]: any
}
export default properties
