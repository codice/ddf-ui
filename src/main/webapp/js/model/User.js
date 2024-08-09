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
export var userModifiableLayerProperties = [
    'id',
    'label',
    'alpha',
    'show',
    'order',
];
function areTheSameLayer(layer1, layer2) {
    return _.isEqual(_.omit(layer1, userModifiableLayerProperties), _.omit(layer2, userModifiableLayerProperties));
}
function isValidLayer(layer) {
    var providers = StartupDataStore.Configuration.getImageryProviders();
    return providers.some(function (provider) { return areTheSameLayer(provider, layer); });
}
// compare to imagery providers and remove any layers that are not in the providers, and add any providers that are not in the layers
function validateMapLayersAgainstProviders(layers) {
    var providers = StartupDataStore.Configuration.getImageryProviders();
    // find layers that have been removed from the providers and remove them
    var layersToRemove = layers.filter(function (model) {
        return !isValidLayer(model.toJSON());
    });
    layers.remove(layersToRemove);
    // find providers that have not been added to the layers and add them
    var layersToAdd = providers.filter(function (provider) {
        return !layers.some(function (model) {
            return areTheSameLayer(provider, model.toJSON());
        });
    });
    layers.add(layersToAdd.map(function (provider) { return new User.MapLayer(provider, { parse: true }); }));
}
;
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
        var _this = this;
        if (!models || models.length === 0) {
            this.set(this.defaults());
        }
        this.listenTo(this, 'add reset', function () {
            validateMapLayersAgainstProviders(_this);
        });
        validateMapLayersAgainstProviders(this);
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
    validate: function () {
        validateMapLayersAgainstProviders(this);
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
        this.savePreferences = _debounce(this.savePreferences, 1200);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9Vc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUNMLFlBQVksRUFDWixRQUFRLEdBQ1QsTUFBTSwrQ0FBK0MsQ0FBQTtBQUN0RCxPQUFPLEtBQUssTUFBTSxtQ0FBbUMsQ0FBQTtBQUNyRCxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFFMUIsT0FBTyxVQUFVLE1BQU0sa0JBQWtCLENBQUE7QUFDekMsT0FBTyxTQUFTLE1BQU0saUJBQWlCLENBQUE7QUFDdkMsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEtBQUssTUFBTSxTQUFTLENBQUE7QUFDM0IsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFBO0FBQzlCLE9BQU8sV0FBVyxNQUFNLGVBQWUsQ0FBQTtBQUN2QyxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUNwQyxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLHVCQUF1QixDQUFBO0FBQzlCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDekIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDcEQsSUFBTSxJQUFJLEdBQUcsRUFBUyxDQUFBO0FBQ3RCLElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2xDLFFBQVE7UUFDTixPQUFPO1lBQ0wsT0FBTyxFQUFFLFNBQVM7WUFDbEIsS0FBSyxFQUFFLE1BQU07U0FDZCxDQUFBO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQTtBQUVGLE1B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aHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQge1xuICBSZXN0cmljdGlvbnMsXG4gIFNlY3VyaXR5LFxufSBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvc2VjdXJpdHkvc2VjdXJpdHknXG5pbXBvcnQgZmV0Y2ggZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL2ZldGNoJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCBfZ2V0IGZyb20gJ2xvZGFzaC5nZXQnXG5pbXBvcnQgX2Nsb25lRGVlcCBmcm9tICdsb2Rhc2guY2xvbmVkZWVwJ1xuaW1wb3J0IF9kZWJvdW5jZSBmcm9tICdsb2Rhc2guZGVib3VuY2UnXG5pbXBvcnQgd3JlcXIgZnJvbSAnLi4vd3JlcXInXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgQWxlcnQgZnJvbSAnLi9BbGVydCdcbmltcG9ydCBDb21tb24gZnJvbSAnLi4vQ29tbW9uJ1xuaW1wb3J0IFVwbG9hZEJhdGNoIGZyb20gJy4vVXBsb2FkQmF0Y2gnXG5pbXBvcnQgbW9tZW50IGZyb20gJ21vbWVudC10aW1lem9uZSdcbmltcG9ydCBRdWVyeVNldHRpbmdzIGZyb20gJy4vUXVlcnlTZXR0aW5ncydcbmltcG9ydCAnYmFja2JvbmUtYXNzb2NpYXRpb25zJ1xuaW1wb3J0IHsgQ29tbW9uQWpheFNldHRpbmdzIH0gZnJvbSAnLi4vQWpheFNldHRpbmdzJ1xuaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vU3RhcnR1cC9zdGFydHVwJ1xuY29uc3QgVXNlciA9IHt9IGFzIGFueVxuY29uc3QgVGhlbWUgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGFsZXR0ZTogJ2RlZmF1bHQnLFxuICAgICAgdGhlbWU6ICdkYXJrJyxcbiAgICB9XG4gIH0sXG59KVxuXG5leHBvcnQgY29uc3QgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMgPSBbXG4gICdpZCcsXG4gICdsYWJlbCcsXG4gICdhbHBoYScsXG4gICdzaG93JyxcbiAgJ29yZGVyJyxcbl1cbmZ1bmN0aW9uIGFyZVRoZVNhbWVMYXllcihsYXllcjE6IGFueSwgbGF5ZXIyOiBhbnkpIHtcbiAgcmV0dXJuIF8uaXNFcXVhbChcbiAgICBfLm9taXQobGF5ZXIxLCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcyksXG4gICAgXy5vbWl0KGxheWVyMiwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpXG4gIClcbn1cbmZ1bmN0aW9uIGlzVmFsaWRMYXllcihsYXllcjogYW55KSB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRJbWFnZXJ5UHJvdmlkZXJzKClcbiAgcmV0dXJuIHByb3ZpZGVycy5zb21lKChwcm92aWRlcjogYW55KSA9PiBhcmVUaGVTYW1lTGF5ZXIocHJvdmlkZXIsIGxheWVyKSlcbn1cblxuLy8gY29tcGFyZSB0byBpbWFnZXJ5IHByb3ZpZGVycyBhbmQgcmVtb3ZlIGFueSBsYXllcnMgdGhhdCBhcmUgbm90IGluIHRoZSBwcm92aWRlcnMsIGFuZCBhZGQgYW55IHByb3ZpZGVycyB0aGF0IGFyZSBub3QgaW4gdGhlIGxheWVyc1xuZnVuY3Rpb24gdmFsaWRhdGVNYXBMYXllcnNBZ2FpbnN0UHJvdmlkZXJzKGxheWVyczogYW55KSB7XG4gIGNvbnN0IHByb3ZpZGVycyA9IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRJbWFnZXJ5UHJvdmlkZXJzKClcbiAgLy8gZmluZCBsYXllcnMgdGhhdCBoYXZlIGJlZW4gcmVtb3ZlZCBmcm9tIHRoZSBwcm92aWRlcnMgYW5kIHJlbW92ZSB0aGVtXG4gIGNvbnN0IGxheWVyc1RvUmVtb3ZlID0gbGF5ZXJzLmZpbHRlcigobW9kZWw6IGFueSkgPT4ge1xuICAgIHJldHVybiAhaXNWYWxpZExheWVyKG1vZGVsLnRvSlNPTigpKVxuICB9KVxuICBsYXllcnMucmVtb3ZlKGxheWVyc1RvUmVtb3ZlKVxuXG4gIC8vIGZpbmQgcHJvdmlkZXJzIHRoYXQgaGF2ZSBub3QgYmVlbiBhZGRlZCB0byB0aGUgbGF5ZXJzIGFuZCBhZGQgdGhlbVxuICBjb25zdCBsYXllcnNUb0FkZCA9IHByb3ZpZGVycy5maWx0ZXIoKHByb3ZpZGVyOiBhbnkpID0+IHtcbiAgICByZXR1cm4gIWxheWVycy5zb21lKChtb2RlbDogYW55KSA9PlxuICAgICAgYXJlVGhlU2FtZUxheWVyKHByb3ZpZGVyLCBtb2RlbC50b0pTT04oKSlcbiAgICApXG4gIH0pXG4gIGxheWVycy5hZGQoXG4gICAgbGF5ZXJzVG9BZGQubWFwKFxuICAgICAgKHByb3ZpZGVyOiBhbnkpID0+IG5ldyAoVXNlciBhcyBhbnkpLk1hcExheWVyKHByb3ZpZGVyLCB7IHBhcnNlOiB0cnVlIH0pXG4gICAgKVxuICApXG59XG5cbjsoVXNlciBhcyBhbnkpLk1hcExheWVyID0gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBhbHBoYTogMC41LFxuICAgICAgc2hvdzogdHJ1ZSxcbiAgICAgIGlkOiB2NCgpLFxuICAgIH1cbiAgfSxcbiAgYmxhY2tsaXN0OiBbJ3dhcm5pbmcnXSxcbiAgdG9KU09OKCkge1xuICAgIHJldHVybiBfLm9taXQodGhpcy5hdHRyaWJ1dGVzLCB0aGlzLmJsYWNrbGlzdClcbiAgfSxcbiAgc2hvdWxkU2hvd0xheWVyKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnc2hvdycpICYmIHRoaXMuZ2V0KCdhbHBoYScpID4gMFxuICB9LFxuICBwYXJzZShyZXNwOiBhbnkpIHtcbiAgICBjb25zdCBsYXllciA9IF8uY2xvbmUocmVzcClcbiAgICBsYXllci5sYWJlbCA9ICdUeXBlOiAnICsgbGF5ZXIudHlwZVxuICAgIGlmIChsYXllci5sYXllcikge1xuICAgICAgbGF5ZXIubGFiZWwgKz0gJyBMYXllcjogJyArIGxheWVyLmxheWVyXG4gICAgfVxuICAgIGlmIChsYXllci5sYXllcnMpIHtcbiAgICAgIGxheWVyLmxhYmVsICs9ICcgTGF5ZXJzOiAnICsgbGF5ZXIubGF5ZXJzLmpvaW4oJywgJylcbiAgICB9XG4gICAgcmV0dXJuIGxheWVyXG4gIH0sXG59KVxuOyhVc2VyIGFzIGFueSkuTWFwTGF5ZXJzID0gQmFja2JvbmUuQ29sbGVjdGlvbi5leHRlbmQoe1xuICBtb2RlbDogKFVzZXIgYXMgYW55KS5NYXBMYXllcixcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIF8ubWFwKFxuICAgICAgXy52YWx1ZXMoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEltYWdlcnlQcm92aWRlcnMoKSksXG4gICAgICAobGF5ZXJDb25maWcpID0+IG5ldyAoVXNlciBhcyBhbnkpLk1hcExheWVyKGxheWVyQ29uZmlnLCB7IHBhcnNlOiB0cnVlIH0pXG4gICAgKVxuICB9LFxuICBpbml0aWFsaXplKG1vZGVsczogYW55KSB7XG4gICAgaWYgKCFtb2RlbHMgfHwgbW9kZWxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5zZXQodGhpcy5kZWZhdWx0cygpKVxuICAgIH1cbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdhZGQgcmVzZXQnLCAoKSA9PiB7XG4gICAgICB2YWxpZGF0ZU1hcExheWVyc0FnYWluc3RQcm92aWRlcnModGhpcylcbiAgICB9KVxuICAgIHZhbGlkYXRlTWFwTGF5ZXJzQWdhaW5zdFByb3ZpZGVycyh0aGlzKVxuICB9LFxuICBjb21wYXJhdG9yKG1vZGVsOiBhbnkpIHtcbiAgICByZXR1cm4gbW9kZWwuZ2V0KCdvcmRlcicpXG4gIH0sXG4gIGdldE1hcExheWVyQ29uZmlnKHVybDogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFdoZXJlKHsgdXJsIH0pXG4gIH0sXG4gIHNhdmVQcmVmZXJlbmNlcygpIHtcbiAgICB0aGlzLnBhcmVudHNbMF0uc2F2ZVByZWZlcmVuY2VzKClcbiAgfSxcbiAgdmFsaWRhdGUoKSB7XG4gICAgdmFsaWRhdGVNYXBMYXllcnNBZ2FpbnN0UHJvdmlkZXJzKHRoaXMpXG4gIH0sXG59KVxuOyhVc2VyIGFzIGFueSkuUHJlZmVyZW5jZXMgPSBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgdXJsOiAnLi9pbnRlcm5hbC91c2VyL3ByZWZlcmVuY2VzJyxcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiAncHJlZmVyZW5jZXMnLFxuICAgICAgbWFwTGF5ZXJzOiBuZXcgKFVzZXIgYXMgYW55KS5NYXBMYXllcnMoKSxcbiAgICAgIHJlc3VsdERpc3BsYXk6ICdMaXN0JyxcbiAgICAgIHJlc3VsdFByZXZpZXc6IFsnbW9kaWZpZWQnXSxcbiAgICAgIHJlc3VsdEZpbHRlcjogdW5kZWZpbmVkLFxuICAgICAgcmVzdWx0U29ydDogdW5kZWZpbmVkLFxuICAgICAgJ2luc3BlY3Rvci1oaWRlRW1wdHknOiBmYWxzZSxcbiAgICAgICdpbnNwZWN0b3Itc3VtbWFyeVNob3duJzogW10sXG4gICAgICAnaW5zcGVjdG9yLXN1bW1hcnlPcmRlcic6IFtdLFxuICAgICAgJ2luc3BlY3Rvci1kZXRhaWxzT3JkZXInOiBbJ3RpdGxlJywgJ2NyZWF0ZWQnLCAnbW9kaWZpZWQnLCAndGh1bWJuYWlsJ10sXG4gICAgICAnaW5zcGVjdG9yLWRldGFpbHNIaWRkZW4nOiBbXSxcbiAgICAgICdyZXN1bHRzLWF0dHJpYnV0ZXNTaG93blRhYmxlJzogW10sXG4gICAgICAncmVzdWx0cy1hdHRyaWJ1dGVzU2hvd25MaXN0JzogW10sXG4gICAgICBob21lRmlsdGVyOiAnT3duZWQgYnkgYW55b25lJyxcbiAgICAgIGhvbWVTb3J0OiAnTGFzdCBtb2RpZmllZCcsXG4gICAgICBob21lRGlzcGxheTogJ0dyaWQnLFxuICAgICAgZGVjaW1hbFByZWNpc2lvbjogMixcbiAgICAgIGFsZXJ0czogW10sXG4gICAgICBhbGVydFBlcnNpc3RlbmNlOiB0cnVlLFxuICAgICAgYWxlcnRFeHBpcmF0aW9uOiAyNTkyMDAwMDAwLFxuICAgICAgdmlzdWFsaXphdGlvbjogJzNkbWFwJyxcbiAgICAgIGNvbHVtbkhpZGU6IFtdLFxuICAgICAgY29sdW1uT3JkZXI6IFsndGl0bGUnLCAnY3JlYXRlZCcsICdtb2RpZmllZCcsICd0aHVtYm5haWwnXSxcbiAgICAgIGNvbHVtbldpZHRoczogW10sXG4gICAgICBoYXNTZWxlY3RlZENvbHVtbnM6IGZhbHNlLFxuICAgICAgdXBsb2FkczogW10sXG4gICAgICBvYXV0aDogW10sXG4gICAgICBmb250U2l6ZTogMTYsXG4gICAgICByZXN1bHRDb3VudDogU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFJlc3VsdENvdW50KCksXG4gICAgICBkYXRlVGltZUZvcm1hdDogQ29tbW9uLmdldERhdGVUaW1lRm9ybWF0cygpWydJU08nXVsnbWlsbGlzZWNvbmQnXSxcbiAgICAgIHRpbWVab25lOiBDb21tb24uZ2V0VGltZVpvbmVzKClbJ1VUQyddLFxuICAgICAgY29vcmRpbmF0ZUZvcm1hdDogJ2RlZ3JlZXMnLFxuICAgICAgYXV0b1BhbjogdHJ1ZSxcbiAgICAgIGdvbGRlbkxheW91dDogdW5kZWZpbmVkLFxuICAgICAgZ29sZGVuTGF5b3V0VXBsb2FkOiB1bmRlZmluZWQsXG4gICAgICBnb2xkZW5MYXlvdXRNZXRhY2FyZDogdW5kZWZpbmVkLFxuICAgICAgZ29sZGVuTGF5b3V0QWxlcnQ6IHVuZGVmaW5lZCxcbiAgICAgIHRoZW1lOiB7XG4gICAgICAgIHBhbGV0dGU6ICdjdXN0b20nLFxuICAgICAgICB0aGVtZTogJ2RhcmsnLFxuICAgICAgfSxcbiAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgIGhvdmVyUHJldmlldzogdHJ1ZSxcbiAgICAgIHF1ZXJ5U2V0dGluZ3M6IG5ldyBRdWVyeVNldHRpbmdzKCksXG4gICAgICBtYXBIb21lOiB1bmRlZmluZWQsXG4gICAgICBhY3RpbmdSb2xlOiAndXNlcicsXG4gICAgfVxuICB9LFxuICByZWxhdGlvbnM6IFtcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5NYW55LFxuICAgICAga2V5OiAnbWFwTGF5ZXJzJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogKFVzZXIgYXMgYW55KS5NYXBMYXllcixcbiAgICAgIGNvbGxlY3Rpb25UeXBlOiAoVXNlciBhcyBhbnkpLk1hcExheWVycyxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk1hbnksXG4gICAgICBrZXk6ICdhbGVydHMnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBBbGVydCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk1hbnksXG4gICAgICBrZXk6ICd1cGxvYWRzJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogVXBsb2FkQmF0Y2gsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5PbmUsXG4gICAgICBrZXk6ICd0aGVtZScsXG4gICAgICByZWxhdGVkTW9kZWw6IFRoZW1lLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuT25lLFxuICAgICAga2V5OiAncXVlcnlTZXR0aW5ncycsXG4gICAgICByZWxhdGVkTW9kZWw6IFF1ZXJ5U2V0dGluZ3MsXG4gICAgfSxcbiAgXSxcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLnNhdmVQcmVmZXJlbmNlcyA9IF9kZWJvdW5jZSh0aGlzLnNhdmVQcmVmZXJlbmNlcywgMTIwMClcbiAgICB0aGlzLmhhbmRsZUFsZXJ0UGVyc2lzdGVuY2UoKVxuICAgIHRoaXMuaGFuZGxlUmVzdWx0Q291bnQoKVxuICAgIHRoaXMubGlzdGVuVG8oKHdyZXFyIGFzIGFueSkudmVudCwgJ2FsZXJ0czphZGQnLCB0aGlzLmFkZEFsZXJ0KVxuICAgIHRoaXMubGlzdGVuVG8oKHdyZXFyIGFzIGFueSkudmVudCwgJ3VwbG9hZHM6YWRkJywgdGhpcy5hZGRVcGxvYWQpXG4gICAgdGhpcy5saXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAncHJlZmVyZW5jZXM6c2F2ZScsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcy5nZXQoJ2FsZXJ0cycpLCAncmVtb3ZlJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmdldCgndXBsb2FkcycpLCAncmVtb3ZlJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmRlY2ltYWxQcmVjaXNpb24nLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6dmlzdWFsaXphdGlvbicsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpmb250U2l6ZScsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpnb2xkZW5MYXlvdXQnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Z29sZGVuTGF5b3V0VXBsb2FkJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmdvbGRlbkxheW91dE1ldGFjYXJkJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmdvbGRlbkxheW91dEFsZXJ0JywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOm1hcEhvbWUnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6dGhlbWUnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6YWN0aW5nUm9sZScsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICB9LFxuICBoYW5kbGVSZW1vdmUoKSB7XG4gICAgdGhpcy5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBhZGRVcGxvYWQodXBsb2FkOiBhbnkpIHtcbiAgICB0aGlzLmdldCgndXBsb2FkcycpLmFkZCh1cGxvYWQpXG4gICAgdGhpcy5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBhZGRBbGVydChhbGVydERldGFpbHM6IGFueSkge1xuICAgIHRoaXMuZ2V0KCdhbGVydHMnKS5hZGQoYWxlcnREZXRhaWxzKVxuICAgIC8qXG4gICAgICogQWRkIGFsZXJ0IHRvIG5vdGlmaWNhdGlvbiBjb3JlXG4gICAgICogQWxlcnQgd2lsbCBiZSByZXRyaWV2ZWQgYW5kIHNlbnQgdG8gdGhlIFVJIGJ5IFVzZXJBcHBsaWNhdGlvbi5qYXZhIChnZXRTdWJqZWN0UHJlZmVyZW5jZXMoKSkgb24gcmVmcmVzaFxuICAgICAqL1xuICAgIGZldGNoKCcuL2ludGVybmFsL3VzZXIvbm90aWZpY2F0aW9ucycsIHtcbiAgICAgIG1ldGhvZDogJ3B1dCcsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFsZXJ0czogW2FsZXJ0RGV0YWlsc10gfSksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgIH0pXG4gICAgdGhpcy5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBuZWVkc1VwZGF0ZSh1cFRvRGF0ZVByZWZzOiBhbnkpIHtcbiAgICBpZiAoXy5pc0VxdWFsKF9jbG9uZURlZXAodXBUb0RhdGVQcmVmcyksIHRoaXMubGFzdFNhdmVkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH0sXG4gIHNhdmVQcmVmZXJlbmNlcygpIHtcbiAgICBjb25zdCBjdXJyZW50UHJlZnMgPSB0aGlzLnRvSlNPTigpXG4gICAgaWYgKCF0aGlzLm5lZWRzVXBkYXRlKGN1cnJlbnRQcmVmcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmxhc3RTYXZlZCA9IF9jbG9uZURlZXAoY3VycmVudFByZWZzKVxuICAgIHRoaXMuc2F2ZShjdXJyZW50UHJlZnMsIHtcbiAgICAgIC4uLkNvbW1vbkFqYXhTZXR0aW5ncyxcbiAgICAgIGRyb3A6IHRydWUsXG4gICAgICB3aXRob3V0U2V0OiB0cnVlLFxuICAgICAgY3VzdG9tRXJyb3JIYW5kbGluZzogdHJ1ZSxcbiAgICAgIGVycm9yOiAoKSA9PiB7XG4gICAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ3NuYWNrJywge1xuICAgICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgICAnSXNzdWUgQXV0aG9yaXppbmcgUmVxdWVzdDogWW91IGFwcGVhciB0byBoYXZlIGJlZW4gbG9nZ2VkIG91dC4gIFBsZWFzZSBzaWduIGluIGFnYWluLicsXG4gICAgICAgICAgc25hY2tQcm9wczoge1xuICAgICAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgfSlcbiAgfSxcbiAgaGFuZGxlUmVzdWx0Q291bnQoKSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICAncmVzdWx0Q291bnQnLFxuICAgICAgTWF0aC5taW4oXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRSZXN1bHRDb3VudCgpLFxuICAgICAgICB0aGlzLmdldCgncmVzdWx0Q291bnQnKVxuICAgICAgKVxuICAgIClcbiAgfSxcbiAgaGFuZGxlQWxlcnRQZXJzaXN0ZW5jZSgpIHtcbiAgICBpZiAoIXRoaXMuZ2V0KCdhbGVydFBlcnNpc3RlbmNlJykpIHtcbiAgICAgIHRoaXMuZ2V0KCdhbGVydHMnKS5yZXNldCgpXG4gICAgICB0aGlzLmdldCgndXBsb2FkcycpLnJlc2V0KClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhwaXJhdGlvbiA9IHRoaXMuZ2V0KCdhbGVydEV4cGlyYXRpb24nKVxuICAgICAgdGhpcy5yZW1vdmVFeHBpcmVkQWxlcnRzKGV4cGlyYXRpb24pXG4gICAgICB0aGlzLnJlbW92ZUV4cGlyZWRVcGxvYWRzKGV4cGlyYXRpb24pXG4gICAgfVxuICB9LFxuICByZW1vdmVFeHBpcmVkQWxlcnRzKGV4cGlyYXRpb246IGFueSkge1xuICAgIGNvbnN0IGV4cGlyZWRBbGVydHMgPSB0aGlzLmdldCgnYWxlcnRzJykuZmlsdGVyKChhbGVydDogYW55KSA9PiB7XG4gICAgICBjb25zdCByZWNpZXZlZEF0ID0gYWxlcnQuZ2V0VGltZUNvbXBhcmF0b3IoKVxuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSByZWNpZXZlZEF0ID4gZXhwaXJhdGlvblxuICAgIH0pXG4gICAgaWYgKGV4cGlyZWRBbGVydHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5nZXQoJ2FsZXJ0cycpLnJlbW92ZShleHBpcmVkQWxlcnRzKVxuICAgIGZldGNoKCcuL2ludGVybmFsL3VzZXIvbm90aWZpY2F0aW9ucycsIHtcbiAgICAgIG1ldGhvZDogJ2RlbGV0ZScsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFsZXJ0czogZXhwaXJlZEFsZXJ0cy5tYXAoKHsgaWQgfTogYW55KSA9PiBpZCkgfSksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgIH0pXG4gIH0sXG4gIHJlbW92ZUV4cGlyZWRVcGxvYWRzKGV4cGlyYXRpb246IGFueSkge1xuICAgIGNvbnN0IGV4cGlyZWRVcGxvYWRzID0gdGhpcy5nZXQoJ3VwbG9hZHMnKS5maWx0ZXIoKHVwbG9hZDogYW55KSA9PiB7XG4gICAgICBjb25zdCByZWNpZXZlZEF0ID0gdXBsb2FkLmdldFRpbWVDb21wYXJhdG9yKClcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gcmVjaWV2ZWRBdCA+IGV4cGlyYXRpb25cbiAgICB9KVxuICAgIHRoaXMuZ2V0KCd1cGxvYWRzJykucmVtb3ZlKGV4cGlyZWRVcGxvYWRzKVxuICB9LFxuICBnZXRTdW1tYXJ5U2hvd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpbnNwZWN0b3Itc3VtbWFyeVNob3duJylcbiAgfSxcbiAgZ2V0SG92ZXJQcmV2aWV3KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnaG92ZXJQcmV2aWV3JylcbiAgfSxcbiAgZ2V0UXVlcnlTZXR0aW5ncygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3F1ZXJ5U2V0dGluZ3MnKVxuICB9LFxuICBnZXREZWNpbWFsUHJlY2lzaW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZGVjaW1hbFByZWNpc2lvbicpXG4gIH0sXG4gIHBhcnNlKGRhdGE6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kcm9wKSB7XG4gICAgICByZXR1cm4ge31cbiAgICB9XG4gICAgcmV0dXJuIGRhdGFcbiAgfSxcbn0pXG47KFVzZXIgYXMgYW55KS5Nb2RlbCA9IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6ICd1c2VyJyxcbiAgICAgIHByZWZlcmVuY2VzOiBuZXcgKFVzZXIgYXMgYW55KS5QcmVmZXJlbmNlcygpLFxuICAgICAgaXNHdWVzdDogdHJ1ZSxcbiAgICAgIHVzZXJuYW1lOiAnZ3Vlc3QnLFxuICAgICAgdXNlcmlkOiAnZ3Vlc3QnLFxuICAgICAgcm9sZXM6IFsnZ3Vlc3QnXSxcbiAgICB9XG4gIH0sXG4gIHJlbGF0aW9uczogW1xuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ3ByZWZlcmVuY2VzJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogKFVzZXIgYXMgYW55KS5QcmVmZXJlbmNlcyxcbiAgICB9LFxuICBdLFxuICBnZXRFbWFpbCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2VtYWlsJylcbiAgfSxcbiAgZ2V0VXNlcklkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcmlkJylcbiAgfSxcbiAgZ2V0VXNlck5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VybmFtZScpXG4gIH0sXG4gIGdldFN1bW1hcnlTaG93bigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0U3VtbWFyeVNob3duKClcbiAgfSxcbiAgZ2V0SG92ZXJQcmV2aWV3KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncHJlZmVyZW5jZXMnKS5nZXRIb3ZlclByZXZpZXcoKVxuICB9LFxuICBnZXRQcmVmZXJlbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgfSxcbiAgc2F2ZVByZWZlcmVuY2VzKCkge1xuICAgIHRoaXMuZ2V0KCdwcmVmZXJlbmNlcycpLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGdldFF1ZXJ5U2V0dGluZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwcmVmZXJlbmNlcycpLmdldFF1ZXJ5U2V0dGluZ3MoKVxuICB9LFxufSlcbjsoVXNlciBhcyBhbnkpLlJlc3BvbnNlID0gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIHVybDogJy4vaW50ZXJuYWwvdXNlcicsXG4gIHJlbGF0aW9uczogW1xuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ3VzZXInLFxuICAgICAgcmVsYXRlZE1vZGVsOiAoVXNlciBhcyBhbnkpLk1vZGVsLFxuICAgIH0sXG4gIF0sXG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICB1c2VyOiBuZXcgKFVzZXIgYXMgYW55KS5Nb2RlbCgpLFxuICAgIH1cbiAgfSxcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdzeW5jJywgdGhpcy5oYW5kbGVTeW5jKVxuICAgIHRoaXMuaGFuZGxlU3luYygpXG4gIH0sXG4gIGhhbmRsZVN5bmMoKSB7XG4gICAgdGhpcy5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuaGFuZGxlQWxlcnRQZXJzaXN0ZW5jZSgpXG4gICAgdGhpcy5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuaGFuZGxlUmVzdWx0Q291bnQoKVxuICB9LFxuICBnZXRHdWVzdFByZWZlcmVuY2VzKCkge1xuICAgIHRyeSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3N0cmluZyB8IG51bGwnIGlzIG5vdCBhc3NpZ25hYmxlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncHJlZmVyZW5jZXMnKSkgfHwge31cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4ge31cbiAgICB9XG4gIH0sXG4gIGdldEVtYWlsKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldEVtYWlsKClcbiAgfSxcbiAgZ2V0VXNlcklkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldFVzZXJJZCgpXG4gIH0sXG4gIGdldFJvbGVzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldCgncm9sZXMnKVxuICB9LFxuICBnZXRVc2VyTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXInKS5nZXRVc2VyTmFtZSgpXG4gIH0sXG4gIGdldFByZWZlcmVuY2VzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldFByZWZlcmVuY2VzKClcbiAgfSxcbiAgc2F2ZVByZWZlcmVuY2VzKCkge1xuICAgIHRoaXMuZ2V0KCd1c2VyJykuc2F2ZVByZWZlcmVuY2VzKClcbiAgfSxcbiAgZ2V0UXVlcnlTZXR0aW5ncygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXInKS5nZXRRdWVyeVNldHRpbmdzKClcbiAgfSxcbiAgZ2V0U3VtbWFyeVNob3duKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldFN1bW1hcnlTaG93bigpXG4gIH0sXG4gIGdldFVzZXJSZWFkYWJsZURhdGVUaW1lKGRhdGU6IGFueSkge1xuICAgIHJldHVybiBtb21lbnRcbiAgICAgIC50eihkYXRlLCB0aGlzLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3RpbWVab25lJykpXG4gICAgICAuZm9ybWF0KFxuICAgICAgICB0aGlzLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ2RhdGVUaW1lRm9ybWF0JylbJ2RhdGV0aW1lZm10J11cbiAgICAgIClcbiAgfSxcbiAgZ2V0QW1QbURpc3BsYXkoKSB7XG4gICAgY29uc3QgdGltZWZtdCA9IHRoaXMuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnZGF0ZVRpbWVGb3JtYXQnKVtcbiAgICAgICd0aW1lZm10J1xuICAgIF1cbiAgICByZXR1cm4gQ29tbW9uLmdldFRpbWVGb3JtYXRzUmV2ZXJzZU1hcCgpW3RpbWVmbXRdLmZvcm1hdCA9PT0gJzEyJ1xuICB9LFxuICBnZXREYXRlVGltZUZvcm1hdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCdkYXRlVGltZUZvcm1hdCcpW1xuICAgICAgJ2RhdGV0aW1lZm10J1xuICAgIF1cbiAgfSxcbiAgZ2V0VGltZVpvbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgndGltZVpvbmUnKVxuICB9LFxuICBnZXRIb3ZlclByZXZpZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0SG92ZXJQcmV2aWV3KClcbiAgfSxcbiAgcGFyc2UoYm9keTogYW55KSB7XG4gICAgaWYgKGJvZHkuaXNHdWVzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdXNlcjogXy5leHRlbmQoeyBpZDogJ3VzZXInIH0sIGJvZHksIHtcbiAgICAgICAgICBwcmVmZXJlbmNlczogXy5leHRlbmQoXG4gICAgICAgICAgICB7IGlkOiAncHJlZmVyZW5jZXMnIH0sXG4gICAgICAgICAgICB0aGlzLmdldEd1ZXN0UHJlZmVyZW5jZXMoKVxuICAgICAgICAgICksXG4gICAgICAgIH0pLFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfLmV4dGVuZChib2R5LnByZWZlcmVuY2VzLCB7IGlkOiAncHJlZmVyZW5jZXMnIH0pXG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyOiBfLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3VzZXInLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApLFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgY2FuUmVhZChtZXRhY2FyZDogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBTZWN1cml0eShSZXN0cmljdGlvbnMuZnJvbShtZXRhY2FyZCkpLmNhblJlYWQodGhpcylcbiAgfSxcbiAgY2FuV3JpdGUodGhpbmc6IGFueSkge1xuICAgIHN3aXRjaCAodGhpbmcudHlwZSkge1xuICAgICAgY2FzZSAnbWV0YWNhcmQtcHJvcGVydGllcyc6XG4gICAgICAgIHJldHVybiBuZXcgU2VjdXJpdHkoUmVzdHJpY3Rpb25zLmZyb20odGhpbmcpKS5jYW5Xcml0ZSh0aGlzKVxuICAgICAgY2FzZSAncXVlcnktcmVzdWx0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FuV3JpdGUodGhpbmcuZ2V0KCdtZXRhY2FyZCcpLmdldCgncHJvcGVydGllcycpKVxuICAgICAgY2FzZSAncXVlcnktcmVzdWx0LmNvbGxlY3Rpb24nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKHRoaW5nLnNvbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICF0aGluZy5zb21lKChzdWJ0aGluZzogYW55KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMuY2FuV3JpdGUoc3VidGhpbmcpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFNlY3VyaXR5KFJlc3RyaWN0aW9ucy5mcm9tKHRoaW5nKSkuY2FuV3JpdGUodGhpcylcbiAgICAgICAgfVxuICAgIH1cbiAgfSxcbiAgY2FuU2hhcmUobWV0YWNhcmQ6IGFueSkge1xuICAgIHJldHVybiBuZXcgU2VjdXJpdHkoUmVzdHJpY3Rpb25zLmZyb20obWV0YWNhcmQpKS5jYW5TaGFyZSh0aGlzKVxuICB9LFxufSlcbmV4cG9ydCBkZWZhdWx0IFVzZXJcbiJdfQ==