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
import {
  Restrictions,
  Security,
} from '../../react-component/utils/security/security'
import fetch from '../../react-component/utils/fetch'
import _ from 'underscore'
import _get from 'lodash.get'
import _cloneDeep from 'lodash.clonedeep'
import wreqr from '../wreqr'
import Backbone from 'backbone'
import Alert from './Alert'
import Common from '../Common'
import UploadBatch from './UploadBatch'
import moment from 'moment-timezone'
import QuerySettings from './QuerySettings'
import 'backbone-associations'
import { CommonAjaxSettings } from '../AjaxSettings'
import { v4 } from 'uuid'
import { StartupDataStore } from './Startup/startup'
const User = {}
const Theme = Backbone.Model.extend({
  defaults() {
    return {
      palette: 'default',
      theme: 'dark',
    }
  },
})
;(User as any).updateMapLayers = function (layers: any) {
  const providers = StartupDataStore.Configuration.getImageryProviders()
  const exclude = ['id', 'label', 'alpha', 'show', 'order']
  const equal = (a: any, b: any) =>
    _.isEqual(_.omit(a, exclude), _.omit(b, exclude))
  const layersToRemove = layers.filter((model: any) => {
    const found = providers.some((provider: any) =>
      equal(provider, model.toJSON())
    )
    return !found && !model.get('userRemovable')
  })
  layers.remove(layersToRemove)
  providers.forEach((provider: any) => {
    const found = layers
      .toArray()
      .some((model: any) => equal(provider, model.toJSON()))
    if (!found) {
      layers.add(new (User as any).MapLayer(provider, { parse: true }))
    }
  })
}
;(User as any).MapLayer = Backbone.AssociatedModel.extend({
  defaults() {
    return {
      alpha: 0.5,
      show: true,
      id: v4(),
    }
  },
  blacklist: ['warning'],
  toJSON() {
    return _.omit(this.attributes, this.blacklist)
  },
  shouldShowLayer() {
    return this.get('show') && this.get('alpha') > 0
  },
  parse(resp: any) {
    const layer = _.clone(resp)
    layer.label = 'Type: ' + layer.type
    if (layer.layer) {
      layer.label += ' Layer: ' + layer.layer
    }
    if (layer.layers) {
      layer.label += ' Layers: ' + layer.layers.join(', ')
    }
    return layer
  },
})
;(User as any).MapLayers = Backbone.Collection.extend({
  model: (User as any).MapLayer,
  defaults() {
    return _.map(
      _.values(StartupDataStore.Configuration.getImageryProviders()),
      (layerConfig) => new (User as any).MapLayer(layerConfig, { parse: true })
    )
  },
  initialize(models: any) {
    if (!models || models.length === 0) {
      this.set(this.defaults())
    }
  },
  comparator(model: any) {
    return model.get('order')
  },
  getMapLayerConfig(url: any) {
    return this.findWhere({ url })
  },
  savePreferences() {
    this.parents[0].savePreferences()
  },
})
;(User as any).Preferences = Backbone.AssociatedModel.extend({
  url: './internal/user/preferences',
  defaults() {
    return {
      id: 'preferences',
      mapLayers: new (User as any).MapLayers(),
      resultDisplay: 'List',
      resultPreview: ['modified'],
      resultFilter: undefined,
      resultSort: undefined,
      'inspector-hideEmpty': false,
      'inspector-summaryShown': [],
      'inspector-summaryOrder': [],
      'inspector-detailsOrder': ['title', 'created', 'modified', 'thumbnail'],
      'inspector-detailsHidden': [],
      'results-attributesShownTable': [],
      'results-attributesShownList': [],
      homeFilter: 'Owned by anyone',
      homeSort: 'Last modified',
      homeDisplay: 'Grid',
      alerts: [],
      alertPersistence: true,
      alertExpiration: 2592000000,
      visualization: '3dmap',
      columnHide: [],
      columnOrder: ['title', 'created', 'modified', 'thumbnail'],
      columnWidths: [],
      hasSelectedColumns: false,
      uploads: [],
      oauth: [],
      fontSize: 16,
      resultCount: StartupDataStore.Configuration.getResultCount(),
      dateTimeFormat: Common.getDateTimeFormats()['ISO']['millisecond'],
      timeZone: Common.getTimeZones()['UTC'],
      coordinateFormat: 'degrees',
      autoPan: true,
      goldenLayout: undefined,
      goldenLayoutUpload: undefined,
      goldenLayoutMetacard: undefined,
      goldenLayoutAlert: undefined,
      theme: {
        palette: 'custom',
        theme: 'dark',
      },
      animation: true,
      hoverPreview: true,
      querySettings: new QuerySettings(),
      mapHome: undefined,
      actingRole: 'user',
    }
  },
  relations: [
    {
      type: Backbone.Many,
      key: 'mapLayers',
      relatedModel: (User as any).MapLayer,
      collectionType: (User as any).MapLayers,
    },
    {
      type: Backbone.Many,
      key: 'alerts',
      relatedModel: Alert,
    },
    {
      type: Backbone.Many,
      key: 'uploads',
      relatedModel: UploadBatch,
    },
    {
      type: Backbone.One,
      key: 'theme',
      relatedModel: Theme,
    },
    {
      type: Backbone.One,
      key: 'querySettings',
      relatedModel: QuerySettings,
    },
  ],
  initialize() {
    this.handleAlertPersistence()
    this.handleResultCount()
    this.listenTo((wreqr as any).vent, 'alerts:add', this.addAlert)
    this.listenTo((wreqr as any).vent, 'uploads:add', this.addUpload)
    this.listenTo((wreqr as any).vent, 'preferences:save', this.savePreferences)
    this.listenTo(this.get('alerts'), 'remove', this.savePreferences)
    this.listenTo(this.get('uploads'), 'remove', this.savePreferences)
    this.listenTo(this, 'change:visualization', this.savePreferences)
    this.listenTo(this, 'change:fontSize', this.savePreferences)
    this.listenTo(this, 'change:goldenLayout', this.savePreferences)
    this.listenTo(this, 'change:goldenLayoutUpload', this.savePreferences)
    this.listenTo(this, 'change:goldenLayoutMetacard', this.savePreferences)
    this.listenTo(this, 'change:goldenLayoutAlert', this.savePreferences)
    this.listenTo(this, 'change:mapHome', this.savePreferences)
    this.listenTo(this, 'change:theme', this.savePreferences)
    this.listenTo(this, 'change:actingRole', this.savePreferences)
  },
  handleRemove() {
    this.savePreferences()
  },
  addUpload(upload: any) {
    this.get('uploads').add(upload)
    this.savePreferences()
  },
  addAlert(alertDetails: any) {
    this.get('alerts').add(alertDetails)
    /*
     * Add alert to notification core
     * Alert will be retrieved and sent to the UI by UserApplication.java (getSubjectPreferences()) on refresh
     */
    fetch('./internal/user/notifications', {
      method: 'put',
      body: JSON.stringify({ alerts: [alertDetails] }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    this.savePreferences()
  },
  needsUpdate(upToDatePrefs: any) {
    if (_.isEqual(_cloneDeep(upToDatePrefs), this.lastSaved)) {
      return false
    }
    return true
  },
  savePreferences() {
    const currentPrefs = this.toJSON()
    if (!this.needsUpdate(currentPrefs)) {
      return
    }
    this.lastSaved = _cloneDeep(currentPrefs)
    this.save(currentPrefs, {
      ...CommonAjaxSettings,
      drop: true,
      withoutSet: true,
      customErrorHandling: true,
      error: () => {
        ;(wreqr as any).vent.trigger('snack', {
          message:
            'Issue Authorizing Request: You appear to have been logged out.  Please sign in again.',
          snackProps: {
            alertProps: {
              severity: 'error',
            },
          },
        })
      },
    })
  },
  handleResultCount() {
    this.set(
      'resultCount',
      Math.min(
        StartupDataStore.Configuration.getResultCount(),
        this.get('resultCount')
      )
    )
  },
  handleAlertPersistence() {
    if (!this.get('alertPersistence')) {
      this.get('alerts').reset()
      this.get('uploads').reset()
    } else {
      const expiration = this.get('alertExpiration')
      this.removeExpiredAlerts(expiration)
      this.removeExpiredUploads(expiration)
    }
  },
  removeExpiredAlerts(expiration: any) {
    const expiredAlerts = this.get('alerts').filter((alert: any) => {
      const recievedAt = alert.getTimeComparator()
      return Date.now() - recievedAt > expiration
    })
    if (expiredAlerts.length === 0) {
      return
    }
    this.get('alerts').remove(expiredAlerts)
    fetch('./internal/user/notifications', {
      method: 'delete',
      body: JSON.stringify({ alerts: expiredAlerts.map(({ id }: any) => id) }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
  removeExpiredUploads(expiration: any) {
    const expiredUploads = this.get('uploads').filter((upload: any) => {
      const recievedAt = upload.getTimeComparator()
      return Date.now() - recievedAt > expiration
    })
    this.get('uploads').remove(expiredUploads)
  },
  getSummaryShown() {
    return this.get('inspector-summaryShown')
  },
  getHoverPreview() {
    return this.get('hoverPreview')
  },
  getQuerySettings() {
    return this.get('querySettings')
  },
  parse(data: any, options: any) {
    if (options && options.drop) {
      return {}
    }
    return data
  },
})
;(User as any).Model = Backbone.AssociatedModel.extend({
  defaults() {
    return {
      id: 'user',
      preferences: new (User as any).Preferences(),
      isGuest: true,
      username: 'guest',
      userid: 'guest',
      roles: ['guest'],
    }
  },
  relations: [
    {
      type: Backbone.One,
      key: 'preferences',
      relatedModel: (User as any).Preferences,
    },
  ],
  getEmail() {
    return this.get('email')
  },
  getUserId() {
    return this.get('userid')
  },
  getUserName() {
    return this.get('username')
  },
  getSummaryShown() {
    return this.get('preferences').getSummaryShown()
  },
  getHoverPreview() {
    return this.get('preferences').getHoverPreview()
  },
  getPreferences() {
    return this.get('preferences')
  },
  savePreferences() {
    this.get('preferences').savePreferences()
  },
  getQuerySettings() {
    return this.get('preferences').getQuerySettings()
  },
})
;(User as any).Response = Backbone.AssociatedModel.extend({
  url: './internal/user',
  relations: [
    {
      type: Backbone.One,
      key: 'user',
      relatedModel: (User as any).Model,
    },
  ],
  defaults() {
    return {
      user: new (User as any).Model(),
    }
  },
  initialize() {
    this.listenTo(this, 'sync', this.handleSync)
    this.handleSync()
  },
  handleSync() {
    this.get('user').get('preferences').handleAlertPersistence()
    this.get('user').get('preferences').handleResultCount()
  },
  getGuestPreferences() {
    try {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | null' is not assignable... Remove this comment to see the full error message
      return JSON.parse(window.localStorage.getItem('preferences')) || {}
    } catch (e) {
      return {}
    }
  },
  getEmail() {
    return this.get('user').getEmail()
  },
  getUserId() {
    return this.get('user').getUserId()
  },
  getRoles() {
    return this.get('user').get('roles')
  },
  getUserName() {
    return this.get('user').getUserName()
  },
  getPreferences() {
    return this.get('user').getPreferences()
  },
  savePreferences() {
    this.get('user').savePreferences()
  },
  getQuerySettings() {
    return this.get('user').getQuerySettings()
  },
  getSummaryShown() {
    return this.get('user').getSummaryShown()
  },
  getUserReadableDateTime(date: any) {
    return moment
      .tz(date, this.get('user').get('preferences').get('timeZone'))
      .format(
        this.get('user').get('preferences').get('dateTimeFormat')['datetimefmt']
      )
  },
  getAmPmDisplay() {
    const timefmt = this.get('user').get('preferences').get('dateTimeFormat')[
      'timefmt'
    ]
    return Common.getTimeFormatsReverseMap()[timefmt].format === '12'
  },
  getDateTimeFormat() {
    return this.get('user').get('preferences').get('dateTimeFormat')[
      'datetimefmt'
    ]
  },
  getTimeZone() {
    return this.get('user').get('preferences').get('timeZone')
  },
  getHoverPreview() {
    return this.get('user').getHoverPreview()
  },
  parse(body: any) {
    if (body.isGuest) {
      return {
        user: _.extend({ id: 'user' }, body, {
          preferences: _.extend(
            { id: 'preferences' },
            this.getGuestPreferences()
          ),
        }),
      }
    } else {
      _.extend(body.preferences, { id: 'preferences' })
      return {
        user: _.extend(
          {
            id: 'user',
          },
          body
        ),
      }
    }
  },
  canRead(metacard: any) {
    return new Security(Restrictions.from(metacard)).canRead(this)
  },
  canWrite(thing: any) {
    switch (thing.type) {
      case 'metacard-properties':
        return new Security(Restrictions.from(thing)).canWrite(this)
      case 'query-result':
        return this.canWrite(thing.get('metacard').get('properties'))
      case 'query-result.collection':
      default:
        if (thing.some !== undefined) {
          !thing.some((subthing: any) => {
            return !this.canWrite(subthing)
          })
        } else {
          return new Security(Restrictions.from(thing)).canWrite(this)
        }
    }
  },
  canShare(metacard: any) {
    return new Security(Restrictions.from(metacard)).canShare(this)
  },
})
export default User
