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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9Vc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUNMLFlBQVksRUFDWixRQUFRLEdBQ1QsTUFBTSwrQ0FBK0MsQ0FBQTtBQUN0RCxPQUFPLEtBQUssTUFBTSxtQ0FBbUMsQ0FBQTtBQUNyRCxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFFMUIsT0FBTyxVQUFVLE1BQU0sa0JBQWtCLENBQUE7QUFDekMsT0FBTyxTQUFTLE1BQU0saUJBQWlCLENBQUE7QUFDdkMsT0FBTyxLQUFLLE1BQU0sVUFBVSxDQUFBO0FBQzVCLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUMvQixPQUFPLEtBQUssTUFBTSxTQUFTLENBQUE7QUFDM0IsT0FBTyxNQUFNLE1BQU0sV0FBVyxDQUFBO0FBQzlCLE9BQU8sV0FBVyxNQUFNLGVBQWUsQ0FBQTtBQUN2QyxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQTtBQUNwQyxPQUFPLGFBQWEsTUFBTSxpQkFBaUIsQ0FBQTtBQUMzQyxPQUFPLHVCQUF1QixDQUFBO0FBQzlCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxNQUFNLENBQUE7QUFDekIsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDcEQsSUFBTSxJQUFJLEdBQUcsRUFBUyxDQUFBO0FBQ3RCLElBQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO0lBQ2xDLFFBQVE7UUFDTixPQUFPO1lBQ0wsT0FBTyxFQUFFLFNBQVM7WUFDbEIsS0FBSyxFQUFFLE1BQU07U0FDZCxDQUFBO0lBQ0gsQ0FBQztDQUNGLENBQUMsQ0FBQTtBQUVGLE1B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LENBQUE7SUFDaEUsQ0FBQztJQUNELFFBQVEsWUFBQyxLQUFVO1FBQW5CLGlCQWdCQztRQWZDLFFBQVEsS0FBSyxDQUFDLElBQUksRUFBRTtZQUNsQixLQUFLLHFCQUFxQjtnQkFDeEIsT0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQzlELEtBQUssY0FBYztnQkFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUE7WUFDL0QsS0FBSyx5QkFBeUIsQ0FBQztZQUMvQjtnQkFDRSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO29CQUM1QixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQyxRQUFhO3dCQUN4QixPQUFPLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtvQkFDakMsQ0FBQyxDQUFDLENBQUE7aUJBQ0g7cUJBQU07b0JBQ0wsT0FBTyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO2lCQUM3RDtTQUNKO0lBQ0gsQ0FBQztJQUNELFFBQVEsWUFBQyxRQUFhO1FBQ3BCLE9BQU8sSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNqRSxDQUFDO0NBQ0YsQ0FBQyxDQUFBO0FBQ0YsZUFBZSxJQUFJLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB7XG4gIFJlc3RyaWN0aW9ucyxcbiAgU2VjdXJpdHksXG59IGZyb20gJy4uLy4uL3JlYWN0LWNvbXBvbmVudC91dGlscy9zZWN1cml0eS9zZWN1cml0eSdcbmltcG9ydCBmZXRjaCBmcm9tICcuLi8uLi9yZWFjdC1jb21wb25lbnQvdXRpbHMvZmV0Y2gnXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0IF9nZXQgZnJvbSAnbG9kYXNoLmdldCdcbmltcG9ydCBfY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC5jbG9uZWRlZXAnXG5pbXBvcnQgX2RlYm91bmNlIGZyb20gJ2xvZGFzaC5kZWJvdW5jZSdcbmltcG9ydCB3cmVxciBmcm9tICcuLi93cmVxcidcbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcbmltcG9ydCBBbGVydCBmcm9tICcuL0FsZXJ0J1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi9Db21tb24nXG5pbXBvcnQgVXBsb2FkQmF0Y2ggZnJvbSAnLi9VcGxvYWRCYXRjaCdcbmltcG9ydCBtb21lbnQgZnJvbSAnbW9tZW50LXRpbWV6b25lJ1xuaW1wb3J0IFF1ZXJ5U2V0dGluZ3MgZnJvbSAnLi9RdWVyeVNldHRpbmdzJ1xuaW1wb3J0ICdiYWNrYm9uZS1hc3NvY2lhdGlvbnMnXG5pbXBvcnQgeyBDb21tb25BamF4U2V0dGluZ3MgfSBmcm9tICcuLi9BamF4U2V0dGluZ3MnXG5pbXBvcnQgeyB2NCB9IGZyb20gJ3V1aWQnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi9TdGFydHVwL3N0YXJ0dXAnXG5jb25zdCBVc2VyID0ge30gYXMgYW55XG5jb25zdCBUaGVtZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwYWxldHRlOiAnZGVmYXVsdCcsXG4gICAgICB0aGVtZTogJ2RhcmsnLFxuICAgIH1cbiAgfSxcbn0pXG5cbmV4cG9ydCBjb25zdCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcyA9IFtcbiAgJ2lkJyxcbiAgJ2xhYmVsJyxcbiAgJ2FscGhhJyxcbiAgJ3Nob3cnLFxuICAnb3JkZXInLFxuXVxuZnVuY3Rpb24gYXJlVGhlU2FtZUxheWVyKGxheWVyMTogYW55LCBsYXllcjI6IGFueSkge1xuICByZXR1cm4gXy5pc0VxdWFsKFxuICAgIF8ub21pdChsYXllcjEsIHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzKSxcbiAgICBfLm9taXQobGF5ZXIyLCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcylcbiAgKVxufVxuZnVuY3Rpb24gaXNWYWxpZExheWVyKGxheWVyOiBhbnkpIHtcbiAgY29uc3QgcHJvdmlkZXJzID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEltYWdlcnlQcm92aWRlcnMoKVxuICByZXR1cm4gcHJvdmlkZXJzLnNvbWUoKHByb3ZpZGVyOiBhbnkpID0+IGFyZVRoZVNhbWVMYXllcihwcm92aWRlciwgbGF5ZXIpKVxufVxuXG4vLyBjb21wYXJlIHRvIGltYWdlcnkgcHJvdmlkZXJzIGFuZCByZW1vdmUgYW55IGxheWVycyB0aGF0IGFyZSBub3QgaW4gdGhlIHByb3ZpZGVycywgYW5kIGFkZCBhbnkgcHJvdmlkZXJzIHRoYXQgYXJlIG5vdCBpbiB0aGUgbGF5ZXJzXG5mdW5jdGlvbiB2YWxpZGF0ZU1hcExheWVyc0FnYWluc3RQcm92aWRlcnMobGF5ZXJzOiBhbnkpIHtcbiAgY29uc3QgcHJvdmlkZXJzID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldEltYWdlcnlQcm92aWRlcnMoKVxuICAvLyBmaW5kIGxheWVycyB0aGF0IGhhdmUgYmVlbiByZW1vdmVkIGZyb20gdGhlIHByb3ZpZGVycyBhbmQgcmVtb3ZlIHRoZW1cbiAgY29uc3QgbGF5ZXJzVG9SZW1vdmUgPSBsYXllcnMuZmlsdGVyKChtb2RlbDogYW55KSA9PiB7XG4gICAgcmV0dXJuICFpc1ZhbGlkTGF5ZXIobW9kZWwudG9KU09OKCkpXG4gIH0pXG4gIGxheWVycy5yZW1vdmUobGF5ZXJzVG9SZW1vdmUpXG5cbiAgLy8gZmluZCBwcm92aWRlcnMgdGhhdCBoYXZlIG5vdCBiZWVuIGFkZGVkIHRvIHRoZSBsYXllcnMgYW5kIGFkZCB0aGVtXG4gIGNvbnN0IGxheWVyc1RvQWRkID0gcHJvdmlkZXJzLmZpbHRlcigocHJvdmlkZXI6IGFueSkgPT4ge1xuICAgIHJldHVybiAhbGF5ZXJzLnNvbWUoKG1vZGVsOiBhbnkpID0+XG4gICAgICBhcmVUaGVTYW1lTGF5ZXIocHJvdmlkZXIsIG1vZGVsLnRvSlNPTigpKVxuICAgIClcbiAgfSlcbiAgbGF5ZXJzLmFkZChcbiAgICBsYXllcnNUb0FkZC5tYXAoXG4gICAgICAocHJvdmlkZXI6IGFueSkgPT4gbmV3IChVc2VyIGFzIGFueSkuTWFwTGF5ZXIocHJvdmlkZXIsIHsgcGFyc2U6IHRydWUgfSlcbiAgICApXG4gIClcbn1cblxuOyhVc2VyIGFzIGFueSkuTWFwTGF5ZXIgPSBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGFscGhhOiAwLjUsXG4gICAgICBzaG93OiB0cnVlLFxuICAgICAgaWQ6IHY0KCksXG4gICAgfVxuICB9LFxuICBibGFja2xpc3Q6IFsnd2FybmluZyddLFxuICB0b0pTT04oKSB7XG4gICAgcmV0dXJuIF8ub21pdCh0aGlzLmF0dHJpYnV0ZXMsIHRoaXMuYmxhY2tsaXN0KVxuICB9LFxuICBzaG91bGRTaG93TGF5ZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdzaG93JykgJiYgdGhpcy5nZXQoJ2FscGhhJykgPiAwXG4gIH0sXG4gIHBhcnNlKHJlc3A6IGFueSkge1xuICAgIGNvbnN0IGxheWVyID0gXy5jbG9uZShyZXNwKVxuICAgIGxheWVyLmxhYmVsID0gJ1R5cGU6ICcgKyBsYXllci50eXBlXG4gICAgaWYgKGxheWVyLmxheWVyKSB7XG4gICAgICBsYXllci5sYWJlbCArPSAnIExheWVyOiAnICsgbGF5ZXIubGF5ZXJcbiAgICB9XG4gICAgaWYgKGxheWVyLmxheWVycykge1xuICAgICAgbGF5ZXIubGFiZWwgKz0gJyBMYXllcnM6ICcgKyBsYXllci5sYXllcnMuam9pbignLCAnKVxuICAgIH1cbiAgICByZXR1cm4gbGF5ZXJcbiAgfSxcbn0pXG47KFVzZXIgYXMgYW55KS5NYXBMYXllcnMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG4gIG1vZGVsOiAoVXNlciBhcyBhbnkpLk1hcExheWVyLFxuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4gXy5tYXAoXG4gICAgICBfLnZhbHVlcyhTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0SW1hZ2VyeVByb3ZpZGVycygpKSxcbiAgICAgIChsYXllckNvbmZpZykgPT4gbmV3IChVc2VyIGFzIGFueSkuTWFwTGF5ZXIobGF5ZXJDb25maWcsIHsgcGFyc2U6IHRydWUgfSlcbiAgICApXG4gIH0sXG4gIGluaXRpYWxpemUobW9kZWxzOiBhbnkpIHtcbiAgICBpZiAoIW1vZGVscyB8fCBtb2RlbHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnNldCh0aGlzLmRlZmF1bHRzKCkpXG4gICAgfVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2FkZCByZXNldCcsICgpID0+IHtcbiAgICAgIHZhbGlkYXRlTWFwTGF5ZXJzQWdhaW5zdFByb3ZpZGVycyh0aGlzKVxuICAgIH0pXG4gICAgdmFsaWRhdGVNYXBMYXllcnNBZ2FpbnN0UHJvdmlkZXJzKHRoaXMpXG4gIH0sXG4gIGNvbXBhcmF0b3IobW9kZWw6IGFueSkge1xuICAgIHJldHVybiBtb2RlbC5nZXQoJ29yZGVyJylcbiAgfSxcbiAgZ2V0TWFwTGF5ZXJDb25maWcodXJsOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5maW5kV2hlcmUoeyB1cmwgfSlcbiAgfSxcbiAgc2F2ZVByZWZlcmVuY2VzKCkge1xuICAgIHRoaXMucGFyZW50c1swXS5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICB2YWxpZGF0ZSgpIHtcbiAgICB2YWxpZGF0ZU1hcExheWVyc0FnYWluc3RQcm92aWRlcnModGhpcylcbiAgfSxcbn0pXG47KFVzZXIgYXMgYW55KS5QcmVmZXJlbmNlcyA9IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICB1cmw6ICcuL2ludGVybmFsL3VzZXIvcHJlZmVyZW5jZXMnLFxuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6ICdwcmVmZXJlbmNlcycsXG4gICAgICBtYXBMYXllcnM6IG5ldyAoVXNlciBhcyBhbnkpLk1hcExheWVycygpLFxuICAgICAgcmVzdWx0RGlzcGxheTogJ0xpc3QnLFxuICAgICAgcmVzdWx0UHJldmlldzogWydtb2RpZmllZCddLFxuICAgICAgcmVzdWx0RmlsdGVyOiB1bmRlZmluZWQsXG4gICAgICByZXN1bHRTb3J0OiB1bmRlZmluZWQsXG4gICAgICAnaW5zcGVjdG9yLWhpZGVFbXB0eSc6IGZhbHNlLFxuICAgICAgJ2luc3BlY3Rvci1zdW1tYXJ5U2hvd24nOiBbXSxcbiAgICAgICdpbnNwZWN0b3Itc3VtbWFyeU9yZGVyJzogW10sXG4gICAgICAnaW5zcGVjdG9yLWRldGFpbHNPcmRlcic6IFsndGl0bGUnLCAnY3JlYXRlZCcsICdtb2RpZmllZCcsICd0aHVtYm5haWwnXSxcbiAgICAgICdpbnNwZWN0b3ItZGV0YWlsc0hpZGRlbic6IFtdLFxuICAgICAgJ3Jlc3VsdHMtYXR0cmlidXRlc1Nob3duVGFibGUnOiBbXSxcbiAgICAgICdyZXN1bHRzLWF0dHJpYnV0ZXNTaG93bkxpc3QnOiBbXSxcbiAgICAgIGhvbWVGaWx0ZXI6ICdPd25lZCBieSBhbnlvbmUnLFxuICAgICAgaG9tZVNvcnQ6ICdMYXN0IG1vZGlmaWVkJyxcbiAgICAgIGhvbWVEaXNwbGF5OiAnR3JpZCcsXG4gICAgICBkZWNpbWFsUHJlY2lzaW9uOiAyLFxuICAgICAgYWxlcnRzOiBbXSxcbiAgICAgIGFsZXJ0UGVyc2lzdGVuY2U6IHRydWUsXG4gICAgICBhbGVydEV4cGlyYXRpb246IDI1OTIwMDAwMDAsXG4gICAgICB2aXN1YWxpemF0aW9uOiAnM2RtYXAnLFxuICAgICAgY29sdW1uSGlkZTogW10sXG4gICAgICBjb2x1bW5PcmRlcjogWyd0aXRsZScsICdjcmVhdGVkJywgJ21vZGlmaWVkJywgJ3RodW1ibmFpbCddLFxuICAgICAgY29sdW1uV2lkdGhzOiBbXSxcbiAgICAgIGhhc1NlbGVjdGVkQ29sdW1uczogZmFsc2UsXG4gICAgICB1cGxvYWRzOiBbXSxcbiAgICAgIG9hdXRoOiBbXSxcbiAgICAgIGZvbnRTaXplOiAxNixcbiAgICAgIHJlc3VsdENvdW50OiBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uZ2V0UmVzdWx0Q291bnQoKSxcbiAgICAgIGRhdGVUaW1lRm9ybWF0OiBDb21tb24uZ2V0RGF0ZVRpbWVGb3JtYXRzKClbJ0lTTyddWydtaWxsaXNlY29uZCddLFxuICAgICAgdGltZVpvbmU6IENvbW1vbi5nZXRUaW1lWm9uZXMoKVsnVVRDJ10sXG4gICAgICBjb29yZGluYXRlRm9ybWF0OiAnZGVncmVlcycsXG4gICAgICBhdXRvUGFuOiB0cnVlLFxuICAgICAgZ29sZGVuTGF5b3V0OiB1bmRlZmluZWQsXG4gICAgICBnb2xkZW5MYXlvdXRVcGxvYWQ6IHVuZGVmaW5lZCxcbiAgICAgIGdvbGRlbkxheW91dE1ldGFjYXJkOiB1bmRlZmluZWQsXG4gICAgICBnb2xkZW5MYXlvdXRBbGVydDogdW5kZWZpbmVkLFxuICAgICAgdGhlbWU6IHtcbiAgICAgICAgcGFsZXR0ZTogJ2N1c3RvbScsXG4gICAgICAgIHRoZW1lOiAnZGFyaycsXG4gICAgICB9LFxuICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgaG92ZXJQcmV2aWV3OiB0cnVlLFxuICAgICAgcXVlcnlTZXR0aW5nczogbmV3IFF1ZXJ5U2V0dGluZ3MoKSxcbiAgICAgIG1hcEhvbWU6IHVuZGVmaW5lZCxcbiAgICB9XG4gIH0sXG4gIHJlbGF0aW9uczogW1xuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk1hbnksXG4gICAgICBrZXk6ICdtYXBMYXllcnMnLFxuICAgICAgcmVsYXRlZE1vZGVsOiAoVXNlciBhcyBhbnkpLk1hcExheWVyLFxuICAgICAgY29sbGVjdGlvblR5cGU6IChVc2VyIGFzIGFueSkuTWFwTGF5ZXJzLFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuTWFueSxcbiAgICAgIGtleTogJ2FsZXJ0cycsXG4gICAgICByZWxhdGVkTW9kZWw6IEFsZXJ0LFxuICAgIH0sXG4gICAge1xuICAgICAgdHlwZTogQmFja2JvbmUuTWFueSxcbiAgICAgIGtleTogJ3VwbG9hZHMnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBVcGxvYWRCYXRjaCxcbiAgICB9LFxuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ3RoZW1lJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogVGhlbWUsXG4gICAgfSxcbiAgICB7XG4gICAgICB0eXBlOiBCYWNrYm9uZS5PbmUsXG4gICAgICBrZXk6ICdxdWVyeVNldHRpbmdzJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogUXVlcnlTZXR0aW5ncyxcbiAgICB9LFxuICBdLFxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuc2F2ZVByZWZlcmVuY2VzID0gX2RlYm91bmNlKHRoaXMuc2F2ZVByZWZlcmVuY2VzLCAxMjAwKVxuICAgIHRoaXMuaGFuZGxlQWxlcnRQZXJzaXN0ZW5jZSgpXG4gICAgdGhpcy5oYW5kbGVSZXN1bHRDb3VudCgpXG4gICAgdGhpcy5saXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAnYWxlcnRzOmFkZCcsIHRoaXMuYWRkQWxlcnQpXG4gICAgdGhpcy5saXN0ZW5Ubygod3JlcXIgYXMgYW55KS52ZW50LCAndXBsb2FkczphZGQnLCB0aGlzLmFkZFVwbG9hZClcbiAgICB0aGlzLmxpc3RlblRvKCh3cmVxciBhcyBhbnkpLnZlbnQsICdwcmVmZXJlbmNlczpzYXZlJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLmdldCgnYWxlcnRzJyksICdyZW1vdmUnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMuZ2V0KCd1cGxvYWRzJyksICdyZW1vdmUnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6ZGVjaW1hbFByZWNpc2lvbicsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTp2aXN1YWxpemF0aW9uJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmZvbnRTaXplJywgdGhpcy5zYXZlUHJlZmVyZW5jZXMpXG4gICAgdGhpcy5saXN0ZW5Ubyh0aGlzLCAnY2hhbmdlOmdvbGRlbkxheW91dCcsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpnb2xkZW5MYXlvdXRVcGxvYWQnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Z29sZGVuTGF5b3V0TWV0YWNhcmQnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6Z29sZGVuTGF5b3V0QWxlcnQnLCB0aGlzLnNhdmVQcmVmZXJlbmNlcylcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6bWFwSG9tZScsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTp0aGVtZScsIHRoaXMuc2F2ZVByZWZlcmVuY2VzKVxuICB9LFxuICBoYW5kbGVSZW1vdmUoKSB7XG4gICAgdGhpcy5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBhZGRVcGxvYWQodXBsb2FkOiBhbnkpIHtcbiAgICB0aGlzLmdldCgndXBsb2FkcycpLmFkZCh1cGxvYWQpXG4gICAgdGhpcy5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBhZGRBbGVydChhbGVydERldGFpbHM6IGFueSkge1xuICAgIHRoaXMuZ2V0KCdhbGVydHMnKS5hZGQoYWxlcnREZXRhaWxzKVxuICAgIC8qXG4gICAgICogQWRkIGFsZXJ0IHRvIG5vdGlmaWNhdGlvbiBjb3JlXG4gICAgICogQWxlcnQgd2lsbCBiZSByZXRyaWV2ZWQgYW5kIHNlbnQgdG8gdGhlIFVJIGJ5IFVzZXJBcHBsaWNhdGlvbi5qYXZhIChnZXRTdWJqZWN0UHJlZmVyZW5jZXMoKSkgb24gcmVmcmVzaFxuICAgICAqL1xuICAgIGZldGNoKCcuL2ludGVybmFsL3VzZXIvbm90aWZpY2F0aW9ucycsIHtcbiAgICAgIG1ldGhvZDogJ3B1dCcsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFsZXJ0czogW2FsZXJ0RGV0YWlsc10gfSksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgIH0pXG4gICAgdGhpcy5zYXZlUHJlZmVyZW5jZXMoKVxuICB9LFxuICBuZWVkc1VwZGF0ZSh1cFRvRGF0ZVByZWZzOiBhbnkpIHtcbiAgICBpZiAoXy5pc0VxdWFsKF9jbG9uZURlZXAodXBUb0RhdGVQcmVmcyksIHRoaXMubGFzdFNhdmVkKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH0sXG4gIHNhdmVQcmVmZXJlbmNlcygpIHtcbiAgICBjb25zdCBjdXJyZW50UHJlZnMgPSB0aGlzLnRvSlNPTigpXG4gICAgaWYgKCF0aGlzLm5lZWRzVXBkYXRlKGN1cnJlbnRQcmVmcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICB0aGlzLmxhc3RTYXZlZCA9IF9jbG9uZURlZXAoY3VycmVudFByZWZzKVxuICAgIHRoaXMuc2F2ZShjdXJyZW50UHJlZnMsIHtcbiAgICAgIC4uLkNvbW1vbkFqYXhTZXR0aW5ncyxcbiAgICAgIGRyb3A6IHRydWUsXG4gICAgICB3aXRob3V0U2V0OiB0cnVlLFxuICAgICAgY3VzdG9tRXJyb3JIYW5kbGluZzogdHJ1ZSxcbiAgICAgIGVycm9yOiAoKSA9PiB7XG4gICAgICAgIDsod3JlcXIgYXMgYW55KS52ZW50LnRyaWdnZXIoJ3NuYWNrJywge1xuICAgICAgICAgIG1lc3NhZ2U6XG4gICAgICAgICAgICAnSXNzdWUgQXV0aG9yaXppbmcgUmVxdWVzdDogWW91IGFwcGVhciB0byBoYXZlIGJlZW4gbG9nZ2VkIG91dC4gIFBsZWFzZSBzaWduIGluIGFnYWluLicsXG4gICAgICAgICAgc25hY2tQcm9wczoge1xuICAgICAgICAgICAgYWxlcnRQcm9wczoge1xuICAgICAgICAgICAgICBzZXZlcml0eTogJ2Vycm9yJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgfSlcbiAgfSxcbiAgaGFuZGxlUmVzdWx0Q291bnQoKSB7XG4gICAgdGhpcy5zZXQoXG4gICAgICAncmVzdWx0Q291bnQnLFxuICAgICAgTWF0aC5taW4oXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5nZXRSZXN1bHRDb3VudCgpLFxuICAgICAgICB0aGlzLmdldCgncmVzdWx0Q291bnQnKVxuICAgICAgKVxuICAgIClcbiAgfSxcbiAgaGFuZGxlQWxlcnRQZXJzaXN0ZW5jZSgpIHtcbiAgICBpZiAoIXRoaXMuZ2V0KCdhbGVydFBlcnNpc3RlbmNlJykpIHtcbiAgICAgIHRoaXMuZ2V0KCdhbGVydHMnKS5yZXNldCgpXG4gICAgICB0aGlzLmdldCgndXBsb2FkcycpLnJlc2V0KClcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZXhwaXJhdGlvbiA9IHRoaXMuZ2V0KCdhbGVydEV4cGlyYXRpb24nKVxuICAgICAgdGhpcy5yZW1vdmVFeHBpcmVkQWxlcnRzKGV4cGlyYXRpb24pXG4gICAgICB0aGlzLnJlbW92ZUV4cGlyZWRVcGxvYWRzKGV4cGlyYXRpb24pXG4gICAgfVxuICB9LFxuICByZW1vdmVFeHBpcmVkQWxlcnRzKGV4cGlyYXRpb246IGFueSkge1xuICAgIGNvbnN0IGV4cGlyZWRBbGVydHMgPSB0aGlzLmdldCgnYWxlcnRzJykuZmlsdGVyKChhbGVydDogYW55KSA9PiB7XG4gICAgICBjb25zdCByZWNpZXZlZEF0ID0gYWxlcnQuZ2V0VGltZUNvbXBhcmF0b3IoKVxuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSByZWNpZXZlZEF0ID4gZXhwaXJhdGlvblxuICAgIH0pXG4gICAgaWYgKGV4cGlyZWRBbGVydHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5nZXQoJ2FsZXJ0cycpLnJlbW92ZShleHBpcmVkQWxlcnRzKVxuICAgIGZldGNoKCcuL2ludGVybmFsL3VzZXIvbm90aWZpY2F0aW9ucycsIHtcbiAgICAgIG1ldGhvZDogJ2RlbGV0ZScsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGFsZXJ0czogZXhwaXJlZEFsZXJ0cy5tYXAoKHsgaWQgfTogYW55KSA9PiBpZCkgfSksXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICB9LFxuICAgIH0pXG4gIH0sXG4gIHJlbW92ZUV4cGlyZWRVcGxvYWRzKGV4cGlyYXRpb246IGFueSkge1xuICAgIGNvbnN0IGV4cGlyZWRVcGxvYWRzID0gdGhpcy5nZXQoJ3VwbG9hZHMnKS5maWx0ZXIoKHVwbG9hZDogYW55KSA9PiB7XG4gICAgICBjb25zdCByZWNpZXZlZEF0ID0gdXBsb2FkLmdldFRpbWVDb21wYXJhdG9yKClcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gcmVjaWV2ZWRBdCA+IGV4cGlyYXRpb25cbiAgICB9KVxuICAgIHRoaXMuZ2V0KCd1cGxvYWRzJykucmVtb3ZlKGV4cGlyZWRVcGxvYWRzKVxuICB9LFxuICBnZXRTdW1tYXJ5U2hvd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdpbnNwZWN0b3Itc3VtbWFyeVNob3duJylcbiAgfSxcbiAgZ2V0SG92ZXJQcmV2aWV3KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnaG92ZXJQcmV2aWV3JylcbiAgfSxcbiAgZ2V0UXVlcnlTZXR0aW5ncygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3F1ZXJ5U2V0dGluZ3MnKVxuICB9LFxuICBnZXREZWNpbWFsUHJlY2lzaW9uKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnZGVjaW1hbFByZWNpc2lvbicpXG4gIH0sXG4gIHBhcnNlKGRhdGE6IGFueSwgb3B0aW9uczogYW55KSB7XG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5kcm9wKSB7XG4gICAgICByZXR1cm4ge31cbiAgICB9XG4gICAgcmV0dXJuIGRhdGFcbiAgfSxcbn0pXG47KFVzZXIgYXMgYW55KS5Nb2RlbCA9IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6ICd1c2VyJyxcbiAgICAgIHByZWZlcmVuY2VzOiBuZXcgKFVzZXIgYXMgYW55KS5QcmVmZXJlbmNlcygpLFxuICAgICAgaXNHdWVzdDogdHJ1ZSxcbiAgICAgIHVzZXJuYW1lOiAnZ3Vlc3QnLFxuICAgICAgdXNlcmlkOiAnZ3Vlc3QnLFxuICAgICAgcm9sZXM6IFsnZ3Vlc3QnXSxcbiAgICB9XG4gIH0sXG4gIHJlbGF0aW9uczogW1xuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ3ByZWZlcmVuY2VzJyxcbiAgICAgIHJlbGF0ZWRNb2RlbDogKFVzZXIgYXMgYW55KS5QcmVmZXJlbmNlcyxcbiAgICB9LFxuICBdLFxuICBnZXRFbWFpbCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2VtYWlsJylcbiAgfSxcbiAgZ2V0VXNlcklkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcmlkJylcbiAgfSxcbiAgZ2V0VXNlck5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VybmFtZScpXG4gIH0sXG4gIGdldFN1bW1hcnlTaG93bigpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0U3VtbWFyeVNob3duKClcbiAgfSxcbiAgZ2V0SG92ZXJQcmV2aWV3KCkge1xuICAgIHJldHVybiB0aGlzLmdldCgncHJlZmVyZW5jZXMnKS5nZXRIb3ZlclByZXZpZXcoKVxuICB9LFxuICBnZXRQcmVmZXJlbmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3ByZWZlcmVuY2VzJylcbiAgfSxcbiAgc2F2ZVByZWZlcmVuY2VzKCkge1xuICAgIHRoaXMuZ2V0KCdwcmVmZXJlbmNlcycpLnNhdmVQcmVmZXJlbmNlcygpXG4gIH0sXG4gIGdldFF1ZXJ5U2V0dGluZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwcmVmZXJlbmNlcycpLmdldFF1ZXJ5U2V0dGluZ3MoKVxuICB9LFxufSlcbjsoVXNlciBhcyBhbnkpLlJlc3BvbnNlID0gQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIHVybDogJy4vaW50ZXJuYWwvdXNlcicsXG4gIHJlbGF0aW9uczogW1xuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ3VzZXInLFxuICAgICAgcmVsYXRlZE1vZGVsOiAoVXNlciBhcyBhbnkpLk1vZGVsLFxuICAgIH0sXG4gIF0sXG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICB1c2VyOiBuZXcgKFVzZXIgYXMgYW55KS5Nb2RlbCgpLFxuICAgIH1cbiAgfSxcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdzeW5jJywgdGhpcy5oYW5kbGVTeW5jKVxuICAgIHRoaXMuaGFuZGxlU3luYygpXG4gIH0sXG4gIGhhbmRsZVN5bmMoKSB7XG4gICAgdGhpcy5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuaGFuZGxlQWxlcnRQZXJzaXN0ZW5jZSgpXG4gICAgdGhpcy5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuaGFuZGxlUmVzdWx0Q291bnQoKVxuICB9LFxuICBnZXRHdWVzdFByZWZlcmVuY2VzKCkge1xuICAgIHRyeSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3N0cmluZyB8IG51bGwnIGlzIG5vdCBhc3NpZ25hYmxlLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncHJlZmVyZW5jZXMnKSkgfHwge31cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4ge31cbiAgICB9XG4gIH0sXG4gIGdldEVtYWlsKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldEVtYWlsKClcbiAgfSxcbiAgZ2V0VXNlcklkKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldFVzZXJJZCgpXG4gIH0sXG4gIGdldFJvbGVzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldCgncm9sZXMnKVxuICB9LFxuICBnZXRVc2VyTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXInKS5nZXRVc2VyTmFtZSgpXG4gIH0sXG4gIGdldFByZWZlcmVuY2VzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldFByZWZlcmVuY2VzKClcbiAgfSxcbiAgc2F2ZVByZWZlcmVuY2VzKCkge1xuICAgIHRoaXMuZ2V0KCd1c2VyJykuc2F2ZVByZWZlcmVuY2VzKClcbiAgfSxcbiAgZ2V0UXVlcnlTZXR0aW5ncygpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXInKS5nZXRRdWVyeVNldHRpbmdzKClcbiAgfSxcbiAgZ2V0U3VtbWFyeVNob3duKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgndXNlcicpLmdldFN1bW1hcnlTaG93bigpXG4gIH0sXG4gIGdldFVzZXJSZWFkYWJsZURhdGVUaW1lKGRhdGU6IGFueSkge1xuICAgIHJldHVybiBtb21lbnRcbiAgICAgIC50eihkYXRlLCB0aGlzLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ3RpbWVab25lJykpXG4gICAgICAuZm9ybWF0KFxuICAgICAgICB0aGlzLmdldCgndXNlcicpLmdldCgncHJlZmVyZW5jZXMnKS5nZXQoJ2RhdGVUaW1lRm9ybWF0JylbJ2RhdGV0aW1lZm10J11cbiAgICAgIClcbiAgfSxcbiAgZ2V0QW1QbURpc3BsYXkoKSB7XG4gICAgY29uc3QgdGltZWZtdCA9IHRoaXMuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgnZGF0ZVRpbWVGb3JtYXQnKVtcbiAgICAgICd0aW1lZm10J1xuICAgIF1cbiAgICByZXR1cm4gQ29tbW9uLmdldFRpbWVGb3JtYXRzUmV2ZXJzZU1hcCgpW3RpbWVmbXRdLmZvcm1hdCA9PT0gJzEyJ1xuICB9LFxuICBnZXREYXRlVGltZUZvcm1hdCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3VzZXInKS5nZXQoJ3ByZWZlcmVuY2VzJykuZ2V0KCdkYXRlVGltZUZvcm1hdCcpW1xuICAgICAgJ2RhdGV0aW1lZm10J1xuICAgIF1cbiAgfSxcbiAgZ2V0VGltZVpvbmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0KCdwcmVmZXJlbmNlcycpLmdldCgndGltZVpvbmUnKVxuICB9LFxuICBnZXRIb3ZlclByZXZpZXcoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCd1c2VyJykuZ2V0SG92ZXJQcmV2aWV3KClcbiAgfSxcbiAgcGFyc2UoYm9keTogYW55KSB7XG4gICAgaWYgKGJvZHkuaXNHdWVzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdXNlcjogXy5leHRlbmQoeyBpZDogJ3VzZXInIH0sIGJvZHksIHtcbiAgICAgICAgICBwcmVmZXJlbmNlczogXy5leHRlbmQoXG4gICAgICAgICAgICB7IGlkOiAncHJlZmVyZW5jZXMnIH0sXG4gICAgICAgICAgICB0aGlzLmdldEd1ZXN0UHJlZmVyZW5jZXMoKVxuICAgICAgICAgICksXG4gICAgICAgIH0pLFxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBfLmV4dGVuZChib2R5LnByZWZlcmVuY2VzLCB7IGlkOiAncHJlZmVyZW5jZXMnIH0pXG4gICAgICByZXR1cm4ge1xuICAgICAgICB1c2VyOiBfLmV4dGVuZChcbiAgICAgICAgICB7XG4gICAgICAgICAgICBpZDogJ3VzZXInLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYm9keVxuICAgICAgICApLFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgY2FuUmVhZChtZXRhY2FyZDogYW55KSB7XG4gICAgcmV0dXJuIG5ldyBTZWN1cml0eShSZXN0cmljdGlvbnMuZnJvbShtZXRhY2FyZCkpLmNhblJlYWQodGhpcylcbiAgfSxcbiAgY2FuV3JpdGUodGhpbmc6IGFueSkge1xuICAgIHN3aXRjaCAodGhpbmcudHlwZSkge1xuICAgICAgY2FzZSAnbWV0YWNhcmQtcHJvcGVydGllcyc6XG4gICAgICAgIHJldHVybiBuZXcgU2VjdXJpdHkoUmVzdHJpY3Rpb25zLmZyb20odGhpbmcpKS5jYW5Xcml0ZSh0aGlzKVxuICAgICAgY2FzZSAncXVlcnktcmVzdWx0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuY2FuV3JpdGUodGhpbmcuZ2V0KCdtZXRhY2FyZCcpLmdldCgncHJvcGVydGllcycpKVxuICAgICAgY2FzZSAncXVlcnktcmVzdWx0LmNvbGxlY3Rpb24nOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKHRoaW5nLnNvbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICF0aGluZy5zb21lKChzdWJ0aGluZzogYW55KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMuY2FuV3JpdGUoc3VidGhpbmcpXG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV3IFNlY3VyaXR5KFJlc3RyaWN0aW9ucy5mcm9tKHRoaW5nKSkuY2FuV3JpdGUodGhpcylcbiAgICAgICAgfVxuICAgIH1cbiAgfSxcbiAgY2FuU2hhcmUobWV0YWNhcmQ6IGFueSkge1xuICAgIHJldHVybiBuZXcgU2VjdXJpdHkoUmVzdHJpY3Rpb25zLmZyb20obWV0YWNhcmQpKS5jYW5TaGFyZSh0aGlzKVxuICB9LFxufSlcbmV4cG9ydCBkZWZhdWx0IFVzZXJcbiJdfQ==