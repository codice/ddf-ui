import { __assign } from "tslib";
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
import { Restrictions, Security, } from '../../react-component/utils/security/security';
import fetch from '../../react-component/utils/fetch';
import _ from 'underscore';
import _cloneDeep from 'lodash.clonedeep';
import _debounce from 'lodash.debounce';
import wreqr from '../wreqr';
import Backbone from 'backbone';
import Alert from './Alert';
import Common from '../Common';
import UploadBatch from './UploadBatch';
import moment from 'moment-timezone';
import QuerySettings from './QuerySettings';
import 'backbone-associations';
import { CommonAjaxSettings } from '../AjaxSettings';
import { v4 } from 'uuid';
import { StartupDataStore } from './Startup/startup';
var User = {};
var Theme = Backbone.Model.extend({
    defaults: function () {
        return {
            palette: 'default',
            theme: 'dark',
        };
    },
});
User.updateMapLayers = function (layers) {
    var providers = StartupDataStore.Configuration.getImageryProviders();
    var exclude = ['id', 'label', 'alpha', 'show', 'order'];
    var equal = function (a, b) {
        return _.isEqual(_.omit(a, exclude), _.omit(b, exclude));
    };
    var layersToRemove = layers.filter(function (model) {
        var found = providers.some(function (provider) {
            return equal(provider, model.toJSON());
        });
        return !found && !model.get('userRemovable');
    });
    layers.remove(layersToRemove);
    providers.forEach(function (provider) {
        var found = layers
            .toArray()
            .some(function (model) { return equal(provider, model.toJSON()); });
        if (!found) {
            layers.add(new User.MapLayer(provider, { parse: true }));
        }
    });
};
User.MapLayer = Backbone.AssociatedModel.extend({
    defaults: function () {
        return {
            alpha: 0.5,
            show: true,
            id: v4(),
        };
    },
    blacklist: ['warning'],
    toJSON: function () {
        return _.omit(this.attributes, this.blacklist);
    },
    shouldShowLayer: function () {
        return this.get('show') && this.get('alpha') > 0;
    },
    parse: function (resp) {
        var layer = _.clone(resp);
        layer.label = 'Type: ' + layer.type;
        if (layer.layer) {
            layer.label += ' Layer: ' + layer.layer;
        }
        if (layer.layers) {
            layer.label += ' Layers: ' + layer.layers.join(', ');
        }
        return layer;
    },
});
User.MapLayers = Backbone.Collection.extend({
    model: User.MapLayer,
    defaults: function () {
        return _.map(_.values(StartupDataStore.Configuration.getImageryProviders()), function (layerConfig) { return new User.MapLayer(layerConfig, { parse: true }); });
    },
    initialize: function (models) {
        if (!models || models.length === 0) {
            this.set(this.defaults());
        }
    },
    comparator: function (model) {
        return model.get('order');
    },
    getMapLayerConfig: function (url) {
        return this.findWhere({ url: url });
    },
    savePreferences: function () {
        this.parents[0].savePreferences();
    },
});
User.Preferences = Backbone.AssociatedModel.extend({
    url: './internal/user/preferences',
    defaults: function () {
        return {
            id: 'preferences',
            mapLayers: new User.MapLayers(),
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
            decimalPrecision: 2,
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
        };
    },
    relations: [
        {
            type: Backbone.Many,
            key: 'mapLayers',
            relatedModel: User.MapLayer,
            collectionType: User.MapLayers,
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
    initialize: function () {
        this.savePreferences = _debounce(this.savePreferences, 1000);
        this.handleAlertPersistence();
        this.handleResultCount();
        this.listenTo(wreqr.vent, 'alerts:add', this.addAlert);
        this.listenTo(wreqr.vent, 'uploads:add', this.addUpload);
        this.listenTo(wreqr.vent, 'preferences:save', this.savePreferences);
        this.listenTo(this.get('alerts'), 'remove', this.savePreferences);
        this.listenTo(this.get('uploads'), 'remove', this.savePreferences);
        this.listenTo(this, 'change:decimalPrecision', this.savePreferences);
        this.listenTo(this, 'change:visualization', this.savePreferences);
        this.listenTo(this, 'change:fontSize', this.savePreferences);
        this.listenTo(this, 'change:goldenLayout', this.savePreferences);
        this.listenTo(this, 'change:goldenLayoutUpload', this.savePreferences);
        this.listenTo(this, 'change:goldenLayoutMetacard', this.savePreferences);
        this.listenTo(this, 'change:goldenLayoutAlert', this.savePreferences);
        this.listenTo(this, 'change:mapHome', this.savePreferences);
        this.listenTo(this, 'change:theme', this.savePreferences);
        this.listenTo(this, 'change:actingRole', this.savePreferences);
    },
    handleRemove: function () {
        this.savePreferences();
    },
    addUpload: function (upload) {
        this.get('uploads').add(upload);
        this.savePreferences();
    },
    addAlert: function (alertDetails) {
        this.get('alerts').add(alertDetails);
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
        });
        this.savePreferences();
    },
    needsUpdate: function (upToDatePrefs) {
        if (_.isEqual(_cloneDeep(upToDatePrefs), this.lastSaved)) {
            return false;
        }
        return true;
    },
    savePreferences: function () {
        var currentPrefs = this.toJSON();
        if (!this.needsUpdate(currentPrefs)) {
            return;
        }
        this.lastSaved = _cloneDeep(currentPrefs);
        this.save(currentPrefs, __assign(__assign({}, CommonAjaxSettings), { drop: true, withoutSet: true, customErrorHandling: true, error: function () {
                ;
                wreqr.vent.trigger('snack', {
                    message: 'Issue Authorizing Request: You appear to have been logged out.  Please sign in again.',
                    snackProps: {
                        alertProps: {
                            severity: 'error',
                        },
                    },
                });
            } }));
    },
    handleResultCount: function () {
        this.set('resultCount', Math.min(StartupDataStore.Configuration.getResultCount(), this.get('resultCount')));
    },
    handleAlertPersistence: function () {
        if (!this.get('alertPersistence')) {
            this.get('alerts').reset();
            this.get('uploads').reset();
        }
        else {
            var expiration = this.get('alertExpiration');
            this.removeExpiredAlerts(expiration);
            this.removeExpiredUploads(expiration);
        }
    },
    removeExpiredAlerts: function (expiration) {
        var expiredAlerts = this.get('alerts').filter(function (alert) {
            var recievedAt = alert.getTimeComparator();
            return Date.now() - recievedAt > expiration;
        });
        if (expiredAlerts.length === 0) {
            return;
        }
        this.get('alerts').remove(expiredAlerts);
        fetch('./internal/user/notifications', {
            method: 'delete',
            body: JSON.stringify({ alerts: expiredAlerts.map(function (_a) {
                    var id = _a.id;
                    return id;
                }) }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    },
    removeExpiredUploads: function (expiration) {
        var expiredUploads = this.get('uploads').filter(function (upload) {
            var recievedAt = upload.getTimeComparator();
            return Date.now() - recievedAt > expiration;
        });
        this.get('uploads').remove(expiredUploads);
    },
    getSummaryShown: function () {
        return this.get('inspector-summaryShown');
    },
    getHoverPreview: function () {
        return this.get('hoverPreview');
    },
    getQuerySettings: function () {
        return this.get('querySettings');
    },
    getDecimalPrecision: function () {
        return this.get('decimalPrecision');
    },
    parse: function (data, options) {
        if (options && options.drop) {
            return {};
        }
        return data;
    },
});
User.Model = Backbone.AssociatedModel.extend({
    defaults: function () {
        return {
            id: 'user',
            preferences: new User.Preferences(),
            isGuest: true,
            username: 'guest',
            userid: 'guest',
            roles: ['guest'],
        };
    },
    relations: [
        {
            type: Backbone.One,
            key: 'preferences',
            relatedModel: User.Preferences,
        },
    ],
    getEmail: function () {
        return this.get('email');
    },
    getUserId: function () {
        return this.get('userid');
    },
    getUserName: function () {
        return this.get('username');
    },
    getSummaryShown: function () {
        return this.get('preferences').getSummaryShown();
    },
    getHoverPreview: function () {
        return this.get('preferences').getHoverPreview();
    },
    getPreferences: function () {
        return this.get('preferences');
    },
    savePreferences: function () {
        this.get('preferences').savePreferences();
    },
    getQuerySettings: function () {
        return this.get('preferences').getQuerySettings();
    },
});
User.Response = Backbone.AssociatedModel.extend({
    url: './internal/user',
    relations: [
        {
            type: Backbone.One,
            key: 'user',
            relatedModel: User.Model,
        },
    ],
    defaults: function () {
        return {
            user: new User.Model(),
        };
    },
    initialize: function () {
        this.listenTo(this, 'sync', this.handleSync);
        this.handleSync();
    },
    handleSync: function () {
        this.get('user').get('preferences').handleAlertPersistence();
        this.get('user').get('preferences').handleResultCount();
    },
    getGuestPreferences: function () {
        try {
            // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | null' is not assignable... Remove this comment to see the full error message
            return JSON.parse(window.localStorage.getItem('preferences')) || {};
        }
        catch (e) {
            return {};
        }
    },
    getEmail: function () {
        return this.get('user').getEmail();
    },
    getUserId: function () {
        return this.get('user').getUserId();
    },
    getRoles: function () {
        return this.get('user').get('roles');
    },
    getUserName: function () {
        return this.get('user').getUserName();
    },
    getPreferences: function () {
        return this.get('user').getPreferences();
    },
    savePreferences: function () {
        this.get('user').savePreferences();
    },
    getQuerySettings: function () {
        return this.get('user').getQuerySettings();
    },
    getSummaryShown: function () {
        return this.get('user').getSummaryShown();
    },
    getUserReadableDateTime: function (date) {
        return moment
            .tz(date, this.get('user').get('preferences').get('timeZone'))
            .format(this.get('user').get('preferences').get('dateTimeFormat')['datetimefmt']);
    },
    getAmPmDisplay: function () {
        var timefmt = this.get('user').get('preferences').get('dateTimeFormat')['timefmt'];
        return Common.getTimeFormatsReverseMap()[timefmt].format === '12';
    },
    getDateTimeFormat: function () {
        return this.get('user').get('preferences').get('dateTimeFormat')['datetimefmt'];
    },
    getTimeZone: function () {
        return this.get('user').get('preferences').get('timeZone');
    },
    getHoverPreview: function () {
        return this.get('user').getHoverPreview();
    },
    parse: function (body) {
        if (body.isGuest) {
            return {
                user: _.extend({ id: 'user' }, body, {
                    preferences: _.extend({ id: 'preferences' }, this.getGuestPreferences()),
                }),
            };
        }
        else {
            _.extend(body.preferences, { id: 'preferences' });
            return {
                user: _.extend({
                    id: 'user',
                }, body),
            };
        }
    },
    canRead: function (metacard) {
        return new Security(Restrictions.from(metacard)).canRead(this);
    },
    canWrite: function (thing) {
        var _this = this;
        switch (thing.type) {
            case 'metacard-properties':
                return new Security(Restrictions.from(thing)).canWrite(this);
            case 'query-result':
                return this.canWrite(thing.get('metacard').get('properties'));
            case 'query-result.collection':
            default:
                if (thing.some !== undefined) {
                    !thing.some(function (subthing) {
                        return !_this.canWrite(subthing);
                    });
                }
                else {
                    return new Security(Restrictions.from(thing)).canWrite(this);
                }
        }
    },
    canShare: function (metacard) {
        return new Security(Restrictions.from(metacard)).canShare(this);
    },
});
export default User;
//# sourceMappingURL=User.js.map