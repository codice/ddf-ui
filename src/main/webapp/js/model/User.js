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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9Vc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUNMLFlBQVksRUFDWixRQUFRLEdBQ1QsTUFBTSwrQ0FBK0MsQ0FBQTtBQUN0RCxPQUFPLEtBQUssTUFBTSxtQ0FBbUMsQ0FBQTtBQUNyRCxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFFMUIsT0FBTyxVQUFVLE1BQU0sa0JBQWtCLENBQUE7QUFDekMsT0FBTyxTQUFTLE1BQU0saUJBQWlCLENBQUE7QUFDdkMsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEtBQUssTUFBTSxTQUFTLENBQUE7QUFDM0IsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFBO0FBQzlCLE9BQU8sV0FBVyxNQUFNLGVBQWUsQ0FBQTtBQUN2QyxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUNwQyxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLHVCQUF1QixDQUFBO0FBQzlCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDekIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDcEQsSUFBTSxJQUFJLEdBQUcsRUFBUyxDQUFBO0FBQ3RCLElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2xDLFFBQVE7UUFDTixPQUFPO1lBQ0wsT0FBTyxFQUFFLFNBQVM7WUFDbEIsS0FBSyxFQUFFLE1BQU07U0FDZCxDQUFBO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQTtBQUVGLE1B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RixDQUFDLENBQUE7QUFDRixlQUFlLElBQUksQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IHtcbiAgUmVzdHJpY3Rpb25zLFxuICBTZWN1cml0eSxcbn0gZnJvbSAnLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3NlY3VyaXR5L3NlY3VyaXR5J1xuaW1wb3J0IGZldGNoIGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9mZXRjaCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgX2dldCBmcm9tICdsb2Rhc2guZ2V0J1xuaW1wb3J0IF9jbG9uZURlZXAgZnJvbSAnbG9kYXNoLmNsb25lZGVlcCdcbmltcG9ydCBfZGVib3VuY2UgZnJvbSAnbG9kYXNoLmRlYm91bmNlJ1xuaW1wb3J0IHdyZXFyIGZyb20gJy4uL3dyZXFyJ1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuaW1wb3J0IEFsZXJ0IGZyb20gJy4vQWxlcnQnXG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uL0NvbW1vbidcbmltcG9ydCBVcGxvYWRCYXRjaCBmcm9tICcuL1VwbG9hZEJhdGNoJ1xuaW1wb3J0IG1vbWVudCBmcm9tICdtb21lbnQtdGltZXpvbmUnXG5pbXBvcnQgUXVlcnlTZXR0aW5ncyBmcm9tICcuL1F1ZXJ5U2V0dGluZ3MnXG5pbXBvcnQgJ2JhY2tib25lLWFzc29jaWF0aW9ucydcbmltcG9ydCB7IENvbW1vbkFqYXhTZXR0aW5ncyB9IGZyb20gJy4uL0FqYXhTZXR0aW5ncydcbmltcG9ydCB7IHY0IH0gZnJvbSAndXVpZCdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuL1N0YXJ0dXAvc3RhcnR1cCdcbmNvbnN0IFVzZXIgPSB7fSBhcyBhbnlcbmNvbnN0IFRoZW1lID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kKHtcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhbGV0dGU6ICdkZWZhdWx0JyxcbiAgICAgIHRoZW1lOiAnZGFyaycsXG4gICAgfVxuICB9LFxufSlcblxuZXhwb3J0IGNvbnN0IHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzID0gW1xuICAnaWQnLFxuICAnbGFiZWwnLFxuICAnYWxwaGEnLFxuICAnc2hvdycsXG4gICdvcmRlcicsXG5dXG5mdW5jdGlvbiBhcmVUaGVTYW1lTGF5ZXIobGF5ZXIxOiBhbnksIGxheWVyMjogYW55KSB7XG4gIHJldHVybiBfLmlzRXF1YWwoXG4gICAgXy5vbWl0KGxheWVyMSwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpLFxuICAgIF8ub21pdChsYXllcjIsIHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzKVxuICApXG59XG5mdW5jdGlvbiBpc1ZhbGlkTGF5ZXIobGF5ZXI6IGFueSkge1xuICBjb25zdCBwcm92aWRlcnMgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0SW1hZ2VyeVByb3ZpZGVycygpXG4gIHJldHVybiBwcm92aWRlcnMuc29tZSgocHJvdmlkZXI6IGFueSkgPT4gYXJlVGhlU2FtZUxheWVyKHByb3ZpZGVyLCBsYXllcikpXG59XG5cbi8vIGNvbXBhcmUgdG8gaW1hZ2VyeSBwcm92aWRlcnMgYW5kIHJlbW92ZSBhbnkgbGF5ZXJzIHRoYXQgYXJlIG5vdCBpbiB0aGUgcHJvdmlkZXJzLCBhbmQgYWRkIGFueSBwcm92aWRlcnMgdGhhdCBhcmUgbm90IGluIHRoZSBsYXllcnNcbmZ1bmN0aW9uIHZhbGlkYXRlTWFwTGF5ZXJzQWdhaW5zdFByb3ZpZGVycyhsYXllcnM6IGFueSkge1xuICBjb25zdCBwcm92aWRlcnMgPSBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0SW1hZ2VyeVByb3ZpZGVycygpXG4gIC8vIGZpbmQgbGF5ZXJzIHRoYXQgaGF2ZSBiZWVuIHJlbW92ZWQgZnJvbSB0aGUgcHJvdmlkZXJzIGFuZCByZW1vdmUgdGhlbVxuICBjb25zdCBsYXllcnNUb1JlbW92ZSA9IGxheWVycy5maWx0ZXIoKG1vZGVsOiBhbnkpID0+IHtcbiAgICByZXR1cm4gIWlzVmFsaWRMYXllcihtb2RlbC50b0pTT04oKSlcbiAgfSlcbiAgbGF5ZXJzLnJlbW92ZShsYXllcnNUb1JlbW92ZSlcblxuICAvLyBmaW5kIHByb3ZpZGVycyB0aGF0IGhhdmUgbm90IGJlZW4gYWRkZWQgdG8gdGhlIGxheWVycyBhbmQgYWRkIHRoZW1cbiAgY29uc3QgbGF5ZXJzVG9BZGQgPSBwcm92aWRlcnMuZmlsdGVyKChwcm92aWRlcjogYW55KSA9PiB7XG4gICAgcmV0dXJuICFsYXllcnMuc29tZSgobW9kZWw6IGFueSkgPT5cbiAgICAgIGFyZVRoZVNhbWVMYXllcihwcm92aWRlciwgbW9kZWwudG9KU09OKCkpXG4gICAgKVxuICB9KVxuICBsYXllcnMuYWRkKFxuICAgIGxheWVyc1RvQWRkLm1hcChcbiAgICAgIChwcm92aWRlcjogYW55KSA9PiBuZXcgKFVzZXIgYXMgYW55KS5NYXBMYXllcihwcm92aWRlciwgeyBwYXJzZTogdHJ1ZSB9KVxuICAgIClcbiAgKVxufVxuXG47KFVzZXIgYXMgYW55KS5NYXBMYXllciA9IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYWxwaGE6IDAuNSxcbiAgICAgIHNob3c6IHRydWUsXG4gICAgICBpZDogdjQoKSxcbiAgICB9XG4gIH0sXG4gIGJsYWNrbGlzdDogWyd3YXJuaW5nJ10sXG4gIHRvSlNPTigpIHtcbiAgICByZXR1cm4gXy5vbWl0KHRoaXMuYXR0cmlidXRlcywgdGhpcy5ibGFja2xpc3QpXG4gIH0sXG4gIHNob3VsZFNob3dMYXllcigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Nob3cnKSAmJiB0aGlzLmdldCgnYWxwaGEnKSA+IDBcbiAgfSxcbiAgcGFyc2UocmVzcDogYW55KSB7XG4gICAgY29uc3QgbGF5ZXIgPSBfLmNsb25lKHJlc3ApXG4gICAgbGF5ZXIubGFiZWwgPSAnVHlwZTogJyArIGxheWVyLnR5cGVcbiAgICBpZiAobGF5ZXIubGF5ZXIpIHtcbiAgICAgIGxheWVyLmxhYmVsICs9ICcgTGF5ZXI6ICcgKyBsYXllci5sYXllclxuICAgIH1cbiAgICBpZiAobGF5ZXIubGF5ZXJzKSB7XG4gICAgICBsYXllci5sYWJlbCArPSAnIExheWVyczogJyArIGxheWVyLmxheWVycy5qb2luKCcsICcpXG4gICAgfVxuICAgIHJldHVybiBsYXllclxuICB9LFxufSlcbjsoVXNlciBhcyBhbnkpLk1hcExheWVycyA9IEJhY2tib25lLkNvbGxlY3Rpb24uZXh0ZW5kKHtcbiAgbW9kZWw6IChVc2VyIGFzIGFueSkuTWFwTGF5ZXIsXG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiBfLm1hcChcbiAgICAgIF8udmFsdWVzKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRJbWFnZXJ5UHJvdmlkZXJzKCkpLFxuICAgICAgKGxheWVyQ29uZmlnKSA9PiBuZXcgKFVzZXIgYXMgYW55KS5NYXBMYXllcihsYXllckNvbmZpZywgeyBwYXJzZTogdHJ1ZSB9KVxuICAgIClcbiAgfSxcbiAgaW5pdGlhbGl6ZShtb2RlbHM6IGFueSkge1xuICAgIGlmICghbW9kZWxzIHx8IG1vZGVscy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRoaXMuc2V0KHRoaXMuZGVmYXVsdHMoKSlcbiAgICB9XG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnYWRkIHJlc2V0JywgKCkgPT4ge1xuICAgICAgdmFsaWRhdGVNYXBMYXllcnNBZ2FpbnN0UHJvdmlkZXJzKHRoaXMpXG4gICAgfSlcbiAgICB2YWxpZGF0ZU1hcExheWVyc0FnYWluc3RQcm92aWRlcnModGhpcylcbiAgfSxcbiAgY29tcGFyYXRvcihtb2RlbDogYW55KSB7XG4gICAgcmV0dXJuIG1vZGVsLmdldCgnb3JkZXInKVxuICB9LFxuICBnZXRNYXBMYXllckNvbmZpZyh1cmw6IGFueSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRXaGVyZSh7IHVybCB9KVxuICB9LFxuICBzYXZlUHJlZmVyZW5jZXMoKSB7XG4gICAgdGhpcy5wYXJlbnRzWzBdLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIHZhbGlkYXRlKCkge1xuICAgIHZhbGlkYXRlTWFwTGF5ZXJzQWdhaW5zdFByb3ZpZGVycyh0aGlzKVxuICB9LFxufSlcbjsoVXNlciBhcyBhbnkpLlByZWZlcmVuY2VzID0gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIHVybDogJy4vaW50ZXJuYWwvdXNlci9wcmVmZXJlbmNlcycsXG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogJ3ByZWZlcmVuY2VzJyxcbiAgICAgIG1hcExheWVyczogbmV3IChVc2VyIGFzIGFueSkuTWFwTGF5ZXJzKCksXG4gICAgICByZXN1bHREaXNwbGF5OiAnTGlzdCcsXG4gICAgICByZXN1bHRQcmV2aWV3OiBbJ21vZGlmaWVkJ10sXG4gICAgICByZXN1bHRGaWx0ZXI6IHVuZGVmaW5lZCxcbiAgICAgIHJlc3VsdFNvcnQ6IHVuZGVmaW5lZCxcbiAgICAgICdpbnNwZWN0b3ItaGlkZUVtcHR5JzogZmFsc2UsXG4gICAgICAnaW5zcGVjdG9yLXN1bW1hcnlTaG93bic6IFtdLFxuICAgICAgJ2luc3BlY3Rvci1zdW1tYXJ5T3JkZXInOiBbXSxcbiAgICAgICdpbnNwZWN0b3ItZGV0YWlsc09yZGVyJzogWyd0aXRsZScsICdjcmVhdGVkJywgJ21vZGlmaWVkJywgJ3RodW1ibmFpbCddLFxuICAgICAgJ2luc3BlY3Rvci1kZXRhaWxzSGlkZGVuJzogW10sXG4gICAgICAncmVzdWx0cy1hdHRyaWJ1dGVzU2hvd25UYWJsZSc6IFtdLFxuICAgICAgJ3Jlc3VsdHMtYXR0cmlidXRlc1Nob3duTGlzdCc6IFtdLFxuICAgICAgaG9tZUZpbHRlcjogJ093bmVkIGJ5IGFueW9uZScsXG4gICAgICBob21lU29ydDogJ0xhc3QgbW9kaWZpZWQnLFxuICAgICAgaG9tZURpc3BsYXk6ICdHcmlkJyxcbiAgICAgIGRlY2ltYWxQcmVjaXNpb246IDIsXG4gICAgICBhbGVydHM6IFtdLFxuICAgICAgYWxlcnRQZXJzaXN0ZW5jZTogdHJ1ZSxcbiAgICAgIGFsZXJ0RXhwaXJhdGlvbjogMjU5MjAwMDAwMCxcbiAgICAgIHZpc3VhbGl6YXRpb246ICczZG1hcCcsXG4gICAgICBjb2x1bW5IaWRlOiBbXSxcbiAgICAgIGNvbHVtbk9yZGVyOiBbJ3RpdGxlJywgJ2NyZWF0ZWQnLCAnbW9kaWZpZWQnLCAndGh1bWJuYWlsJ10sXG4gICAgICBjb2x1bW5XaWR0aHM6IFtdLFxuICAgICAgaGFzU2VsZWN0ZWRDb2x1bW5zOiBmYWxzZSxcbiAgICAgIHVwbG9hZHM6IFtdLFxuICAgICAgb2F1dGg6IFtdLFxuICAgICAgZm9udFNpemU6IDE2LFxuICAgICAgcmVzdWx0Q291bnQ6IFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRSZXN1bHRDb3VudCgpLFxuICAgICAgZGF0ZVRpbWVGb3JtYXQ6IENvbW1vbi5nZXREYXRlVGltZUZvcm1hdHMoKVsnSVNPJ11bJ21pbGxpc2Vjb25kJ10sXG4gICAgICB0aW1lWm9uZTogQ29tbW9uLmdldFRpbWVab25lcygpWydVVEMnXSxcbiAgICAgIGNvb3JkaW5hdGVGb3JtYXQ6ICdkZWdyZWVzJyxcbiAgICAgIGF1dG9QYW46IHRydWUsXG4gICAgICBnb2xkZW5MYXlvdXQ6IHVuZGVmaW5lZCxcbiAgICAgIGdvbGRlbkxheW91dFVwbG9hZDogdW5kZWZpbmVkLFxuICAgICAgZ29sZGVuTGF5b3V0TWV0YWNhcmQ6IHVuZGVmaW5lZCxcbiAgICAgIGdvbGRlbkxheW91dEFsZXJ0OiB1bmRlZmluZWQsXG4gICAgICB0aGVtZToge1xuICAgICAgICBwYWxldHRlOiAnY3VzdG9tJyxcbiAgICAgICAgdGhlbWU6ICdkYXJrJyxcbiAgICAgIH0sXG4gICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICBob3ZlclByZXZpZXc6IHRydWUsXG4gICAgICBxdWVyeVNldHRpbmdzOiBuZXcgUXVlcnlTZXR0aW5ncygpLFxuICAgICAgbWFwSG9tZTogdW5kZWZpbmVkLFxuICAgIH1cbiAgfSxcbiAgcmVsYXRpb25zOiBbXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuTWFueSxcbiAgICAgIGtleTogJ21hcExheWVycycsXG4gICAgICByZWxhdGVkTW9kZWw6IChVc2VyIGFzIGFueSkuTWFwTGF5ZXIsXG4gICAgICBjb2xsZWN0aW9uVHlwZTogKFVzZXIgYXMgYW55KS5NYXBMYXllcnMsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5NYW55LFxuICAgICAga2V5OiAnYWxlcnRzJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogQWxlcnQsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5NYW55LFxuICAgICAga2V5OiAndXBsb2FkcycsXG4gICAgICByZWxhdGVkTW9kZWw6IFVwbG9hZEJhdGNoLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuT25lLFxuICAgICAga2V5OiAndGhlbWUnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBUaGVtZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ3F1ZXJ5U2V0dGluZ3MnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBRdWVyeVNldHRpbmdzLFxuICAgIH0sXG4gIF0sXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5zYXZlUHJlZmVyZW5jZXMgPSBfZGVib3VuY2UodGhpcy5zYXZlUHJlZmVyZW5jZXMsIDEyMDApXG4gICAgdGhpcy5oYW5kbGVBbGVydFBlcnNpc3RlbmNlKClcbiAgICB0aGlzLmhhbmRsZVJlc3VsdENvdW50KClcbiAgICB0aGlzLmxpc3RlblRvKCh3cmVxciBhcyBhbnkpLnZlbnQsICdhbGVydHM6YWRkJywgdGhpcy5hZGRBbGVydClcbiAgICB0aGlzLmxpc3RlblRvKCh3cmVxciBhcyBhbnkpLnZlbnQsICd1cGxvYWRzOmFkZCcsIHRoaXMuYWRkVXBsb2FkKVxuICAgIHRoaXMubGlzdGVuVG8oKHdyZXFyIGFzIGFueSkudmVudCwgJ3ByZWZlcmVuY2VzOnNhdmUnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMuZ2V0KCdhbGVydHMnKSwgJ3JlbW92ZScsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcy5nZXQoJ3VwbG9hZHMnKSwgJ3JlbW92ZScsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpkZWNpbWFsUHJlY2lzaW9uJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnZpc3VhbGl6YXRpb24nLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Zm9udFNpemUnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Z29sZGVuTGF5b3V0JywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmdvbGRlbkxheW91dFVwbG9hZCcsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpnb2xkZW5MYXlvdXRNZXRhY2FyZCcsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpnb2xkZW5MYXlvdXRBbGVydCcsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTptYXBIb21lJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOnRoZW1lJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gIH0sXG4gIGhhbmRsZVJlbW92ZSgpIHtcbiAgICB0aGlzLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGFkZFVwbG9hZCh1cGxvYWQ6IGFueSkge1xuICAgIHRoaXMuZ2V0KCd1cGxvYWRzJykuYWRkKHVwbG9hZClcbiAgICB0aGlzLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGFkZEFsZXJ0KGFsZXJ0RGV0YWlsczogYW55KSB7XG4gICAgdGhpcy5nZXQoJ2FsZXJ0cycpLmFkZChhbGVydERldGFpbHMpXG4gICAgLypcbiAgICAgKiBBZGQgYWxlcnQgdG8gbm90aWZpY2F0aW9uIGNvcmVcbiAgICAgKiBBbGVydCB3aWxsIGJlIHJldHJpZXZlZCBhbmQgc2VudCB0byB0aGUgVUkgYnkgVXNlckFwcGxpY2F0aW9uLmphdmEgKGdldFN1YmplY3RQcmVmZXJlbmNlcygpKSBvbiByZWZyZXNoXG4gICAgICovXG4gICAgZmV0Y2goJy4vaW50ZXJuYWwvdXNlci9ub3RpZmljYXRpb25zJywge1xuICAgICAgbWV0aG9kOiAncHV0JyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgYWxlcnRzOiBbYWxlcnREZXRhaWxzXSB9KSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0sXG4gICAgfSlcbiAgICB0aGlzLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIG5lZWRzVXBkYXRlKHVwVG9EYXRlUHJlZnM6IGFueSkge1xuICAgIGlmIChfLmlzRXF1YWwoX2Nsb25lRGVlcCh1cFRvRGF0ZVByZWZzKSwgdGhpcy5sYXN0U2F2ZWQpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfSxcbiAgc2F2ZVByZWZlcmVuY2VzKCkge1xuICAgIGNvbnN0IGN1cnJlbnRQcmVmcyA9IHRoaXMudG9KU09OKClcbiAgICBpZiAoIXRoaXMubmVlZHNVcGRhdGUoY3VycmVudFByZWZzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHRoaXMubGFzdFNhdmVkID0gX2Nsb25lRGVlcChjdXJyZW50UHJlZnMpXG4gICAgdGhpcy5zYXZlKGN1cnJlbnRQcmVmcywge1xuICAgICAgLi4uQ29tbW9uQWpheFNldHRpbmdzLFxuICAgICAgZHJvcDogdHJ1ZSxcbiAgICAgIHdpdGhvdXRTZXQ6IHRydWUsXG4gICAgICBjdXN0b21FcnJvckhhbmRsaW5nOiB0cnVlLFxuICAgICAgZXJyb3I6ICgpID0+IHtcbiAgICAgICAgOyh3cmVxciBhcyBhbnkpLnZlbnQudHJpZ2dlcignc25hY2snLCB7XG4gICAgICAgICAgbWVzc2FnZTpcbiAgICAgICAgICAgICdJc3N1ZSBBdXRob3JpemluZyBSZXF1ZXN0OiBZb3UgYXBwZWFyIHRvIGhhdmUgYmVlbiBsb2dnZWQgb3V0LiAgUGxlYXNlIHNpZ24gaW4gYWdhaW4uJyxcbiAgICAgICAgICBzbmFja1Byb3BzOiB7XG4gICAgICAgICAgICBhbGVydFByb3BzOiB7XG4gICAgICAgICAgICAgIHNldmVyaXR5OiAnZXJyb3InLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KVxuICAgICAgfSxcbiAgICB9KVxuICB9LFxuICBoYW5kbGVSZXN1bHRDb3VudCgpIHtcbiAgICB0aGlzLnNldChcbiAgICAgICdyZXN1bHRDb3VudCcsXG4gICAgICBNYXRoLm1pbihcbiAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldFJlc3VsdENvdW50KCksXG4gICAgICAgIHRoaXMuZ2V0KCdyZXN1bHRDb3VudCcpXG4gICAgICApXG4gICAgKVxuICB9LFxuICBoYW5kbGVBbGVydFBlcnNpc3RlbmNlKCkge1xuICAgIGlmICghdGhpcy5nZXQoJ2FsZXJ0UGVyc2lzdGVuY2UnKSkge1xuICAgICAgdGhpcy5nZXQoJ2FsZXJ0cycpLnJlc2V0KClcbiAgICAgIHRoaXMuZ2V0KCd1cGxvYWRzJykucmVzZXQoKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBleHBpcmF0aW9uID0gdGhpcy5nZXQoJ2FsZXJ0RXhwaXJhdGlvbicpXG4gICAgICB0aGlzLnJlbW92ZUV4cGlyZWRBbGVydHMoZXhwaXJhdGlvbilcbiAgICAgIHRoaXMucmVtb3ZlRXhwaXJlZFVwbG9hZHMoZXhwaXJhdGlvbilcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUV4cGlyZWRBbGVydHMoZXhwaXJhdGlvbjogYW55KSB7XG4gICAgY29uc3QgZXhwaXJlZEFsZXJ0cyA9IHRoaXMuZ2V0KCdhbGVydHMnKS5maWx0ZXIoKGFsZXJ0OiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHJlY2lldmVkQXQgPSBhbGVydC5nZXRUaW1lQ29tcGFyYXRvcigpXG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIHJlY2lldmVkQXQgPiBleHBpcmF0aW9uXG4gICAgfSlcbiAgICBpZiAoZXhwaXJlZEFsZXJ0cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmdldCgnYWxlcnRzJykucmVtb3ZlKGV4cGlyZWRBbGVydHMpXG4gICAgZmV0Y2goJy4vaW50ZXJuYWwvdXNlci9ub3RpZmljYXRpb25zJywge1xuICAgICAgbWV0aG9kOiAnZGVsZXRlJyxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgYWxlcnRzOiBleHBpcmVkQWxlcnRzLm1hcCgoeyBpZCB9OiBhbnkpID0+IGlkKSB9KSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0sXG4gICAgfSlcbiAgfSxcbiAgcmVtb3ZlRXhwaXJlZFVwbG9hZHMoZXhwaXJhdGlvbjogYW55KSB7XG4gICAgY29uc3QgZXhwaXJlZFVwbG9hZHMgPSB0aGlzLmdldCgndXBsb2FkcycpLmZpbHRlcigodXBsb2FkOiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IHJlY2lldmVkQXQgPSB1cGxvYWQuZ2V0VGltZUNvbXBhcmF0b3IoKVxuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSByZWNpZXZlZEF0ID4gZXhwaXJhdGlvblxuICAgIH0pXG4gICAgdGhpcy5nZXQoJ3VwbG9hZHMnKS5yZW1vdmUoZXhwaXJlZFVwbG9hZHMpXG4gIH0sXG4gIGdldFN1bW1hcnlTaG93bigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2luc3BlY3Rvci1zdW1tYXJ5U2hvd24nKVxuICB9LFxuICBnZXRIb3ZlclByZXZpZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdob3ZlclByZXZpZXcnKVxuICB9LFxuICBnZXRRdWVyeVNldHRpbmdzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncXVlcnlTZXR0aW5ncycpXG4gIH0sXG4gIGdldERlY2ltYWxQcmVjaXNpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkZWNpbWFsUHJlY2lzaW9uJylcbiAgfSxcbiAgcGFyc2UoZGF0YTogYW55LCBvcHRpb25zOiBhbnkpIHtcbiAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmRyb3ApIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cbiAgICByZXR1cm4gZGF0YVxuICB9LFxufSlcbjsoVXNlciBhcyBhbnkpLk1vZGVsID0gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBpZDogJ3VzZXInLFxuICAgICAgcHJlZmVyZW5jZXM6IG5ldyAoVXNlciBhcyBhbnkpLlByZWZlcmVuY2VzKCksXG4gICAgICBpc0d1ZXN0OiB0cnVlLFxuICAgICAgdXNlcm5hbWU6ICdndWVzdCcsXG4gICAgICB1c2VyaWQ6ICdndWVzdCcsXG4gICAgICByb2xlczogWydndWVzdCddLFxuICAgIH1cbiAgfSxcbiAgcmVsYXRpb25zOiBbXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuT25lLFxuICAgICAga2V5OiAncHJlZmVyZW5jZXMnLFxuICAgICAgcmVsYXRlZE1vZGVsOiAoVXNlciBhcyBhbnkpLlByZWZlcmVuY2VzLFxuICAgIH0sXG4gIF0sXG4gIGdldEVtYWlsKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZW1haWwnKVxuICB9LFxuICBnZXRVc2VySWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyaWQnKVxuICB9LFxuICBnZXRVc2VyTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXJuYW1lJylcbiAgfSxcbiAgZ2V0U3VtbWFyeVNob3duKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncHJlZmVyZW5jZXMnKS5nZXRTdW1tYXJ5U2hvd24oKVxuICB9LFxuICBnZXRIb3ZlclByZXZpZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwcmVmZXJlbmNlcycpLmdldEhvdmVyUHJldmlldygpXG4gIH0sXG4gIGdldFByZWZlcmVuY2VzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncHJlZmVyZW5jZXMnKVxuICB9LFxuICBzYXZlUHJlZmVyZW5jZXMoKSB7XG4gICAgdGhpcy5nZXQoJ3ByZWZlcmVuY2VzJykuc2F2ZVByZWZlcmVuY2VzKClcbiAgfSxcbiAgZ2V0UXVlcnlTZXR0aW5ncygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0UXVlcnlTZXR0aW5ncygpXG4gIH0sXG59KVxuOyhVc2VyIGFzIGFueSkuUmVzcG9uc2UgPSBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgdXJsOiAnLi9pbnRlcm5hbC91c2VyJyxcbiAgcmVsYXRpb25zOiBbXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuT25lLFxuICAgICAga2V5OiAndXNlcicsXG4gICAgICByZWxhdGVkTW9kZWw6IChVc2VyIGFzIGFueSkuTW9kZWwsXG4gICAgfSxcbiAgXSxcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXI6IG5ldyAoVXNlciBhcyBhbnkpLk1vZGVsKCksXG4gICAgfVxuICB9LFxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ3N5bmMnLCB0aGlzLmhhbmRsZVN5bmMpXG4gICAgdGhpcy5oYW5kbGVTeW5jKClcbiAgfSxcbiAgaGFuZGxlU3luYygpIHtcbiAgICB0aGlzLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5oYW5kbGVBbGVydFBlcnNpc3RlbmNlKClcbiAgICB0aGlzLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5oYW5kbGVSZXN1bHRDb3VudCgpXG4gIH0sXG4gIGdldEd1ZXN0UHJlZmVyZW5jZXMoKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgdHMtbWlncmF0ZSgyMzQ1KSBGSVhNRTogQXJndW1lbnQgb2YgdHlwZSAnc3RyaW5nIHwgbnVsbCcgaXMgbm90IGFzc2lnbmFibGUuLi4gUmVtb3ZlIHRoaXMgY29tbWVudCB0byBzZWUgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZVxuICAgICAgcmV0dXJuIEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwcmVmZXJlbmNlcycpKSB8fCB7fVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH1cbiAgfSxcbiAgZ2V0RW1haWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0RW1haWwoKVxuICB9LFxuICBnZXRVc2VySWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0VXNlcklkKClcbiAgfSxcbiAgZ2V0Um9sZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0KCdyb2xlcycpXG4gIH0sXG4gIGdldFVzZXJOYW1lKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldFVzZXJOYW1lKClcbiAgfSxcbiAgZ2V0UHJlZmVyZW5jZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0UHJlZmVyZW5jZXMoKVxuICB9LFxuICBzYXZlUHJlZmVyZW5jZXMoKSB7XG4gICAgdGhpcy5nZXQoJ3VzZXInKS5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBnZXRRdWVyeVNldHRpbmdzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldFF1ZXJ5U2V0dGluZ3MoKVxuICB9LFxuICBnZXRTdW1tYXJ5U2hvd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0U3VtbWFyeVNob3duKClcbiAgfSxcbiAgZ2V0VXNlclJlYWRhYmxlRGF0ZVRpbWUoZGF0ZTogYW55KSB7XG4gICAgcmV0dXJuIG1vbWVudFxuICAgICAgLnR6KGRhdGUsIHRoaXMuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgndGltZVpvbmUnKSlcbiAgICAgIC5mb3JtYXQoXG4gICAgICAgIHRoaXMuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnZGF0ZVRpbWVGb3JtYXQnKVsnZGF0ZXRpbWVmbXQnXVxuICAgICAgKVxuICB9LFxuICBnZXRBbVBtRGlzcGxheSgpIHtcbiAgICBjb25zdCB0aW1lZm10ID0gdGhpcy5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCdkYXRlVGltZUZvcm1hdCcpW1xuICAgICAgJ3RpbWVmbXQnXG4gICAgXVxuICAgIHJldHVybiBDb21tb24uZ2V0VGltZUZvcm1hdHNSZXZlcnNlTWFwKClbdGltZWZtdF0uZm9ybWF0ID09PSAnMTInXG4gIH0sXG4gIGdldERhdGVUaW1lRm9ybWF0KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ2RhdGVUaW1lRm9ybWF0JylbXG4gICAgICAnZGF0ZXRpbWVmbXQnXG4gICAgXVxuICB9LFxuICBnZXRUaW1lWm9uZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCd0aW1lWm9uZScpXG4gIH0sXG4gIGdldEhvdmVyUHJldmlldygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXInKS5nZXRIb3ZlclByZXZpZXcoKVxuICB9LFxuICBwYXJzZShib2R5OiBhbnkpIHtcbiAgICBpZiAoYm9keS5pc0d1ZXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyOiBfLmV4dGVuZCh7IGlkOiAndXNlcicgfSwgYm9keSwge1xuICAgICAgICAgIHByZWZlcmVuY2VzOiBfLmV4dGVuZChcbiAgICAgICAgICAgIHsgaWQ6ICdwcmVmZXJlbmNlcycgfSxcbiAgICAgICAgICAgIHRoaXMuZ2V0R3Vlc3RQcmVmZXJlbmNlcygpXG4gICAgICAgICAgKSxcbiAgICAgICAgfSksXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF8uZXh0ZW5kKGJvZHkucHJlZmVyZW5jZXMsIHsgaWQ6ICdwcmVmZXJlbmNlcycgfSlcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHVzZXI6IF8uZXh0ZW5kKFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGlkOiAndXNlcicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICBib2R5XG4gICAgICAgICksXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBjYW5SZWFkKG1ldGFjYXJkOiBhbnkpIHtcbiAgICByZXR1cm4gbmV3IFNlY3VyaXR5KFJlc3RyaWN0aW9ucy5mcm9tKG1ldGFjYXJkKSkuY2FuUmVhZCh0aGlzKVxuICB9LFxuICBjYW5Xcml0ZSh0aGluZzogYW55KSB7XG4gICAgc3dpdGNoICh0aGluZy50eXBlKSB7XG4gICAgICBjYXNlICdtZXRhY2FyZC1wcm9wZXJ0aWVzJzpcbiAgICAgICAgcmV0dXJuIG5ldyBTZWN1cml0eShSZXN0cmljdGlvbnMuZnJvbSh0aGluZykpLmNhbldyaXRlKHRoaXMpXG4gICAgICBjYXNlICdxdWVyeS1yZXN1bHQnOlxuICAgICAgICByZXR1cm4gdGhpcy5jYW5Xcml0ZSh0aGluZy5nZXQoJ21ldGFjYXJkJykuZ2V0KCdwcm9wZXJ0aWVzJykpXG4gICAgICBjYXNlICdxdWVyeS1yZXN1bHQuY29sbGVjdGlvbic6XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAodGhpbmcuc29tZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgIXRoaW5nLnNvbWUoKHN1YnRoaW5nOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jYW5Xcml0ZShzdWJ0aGluZylcbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBuZXcgU2VjdXJpdHkoUmVzdHJpY3Rpb25zLmZyb20odGhpbmcpKS5jYW5Xcml0ZSh0aGlzKVxuICAgICAgICB9XG4gICAgfVxuICB9LFxuICBjYW5TaGFyZShtZXRhY2FyZDogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBTZWN1cml0eShSZXN0cmljdGlvbnMuZnJvbShtZXRhY2FyZCkpLmNhblNoYXJlKHRoaXMpXG4gIH0sXG59KVxuZXhwb3J0IGRlZmF1bHQgVXNlclxuIl19