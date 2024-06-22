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
import { expect } from 'chai';
import user from '../../component/singletons/user-instance';
import { StartupDataStore } from './Startup/startup';
import _ from 'underscore';
import { userModifiableLayerProperties } from './User';
var exampleProviders1 = [
    {
        proxyEnabled: true,
        withCredentials: false,
        alpha: 1,
        name: 'World Topo Map - 1',
        show: true,
        type: 'AGM',
        parameters: {
            transparent: true,
            format: 'image/png',
        },
        url: './proxy/catalog20',
        order: 0,
    },
    {
        proxyEnabled: true,
        withCredentials: false,
        alpha: 1,
        name: 'World Imagery - 3',
        show: true,
        type: 'AGM',
        parameters: {
            transparent: true,
            format: 'image/png',
        },
        url: './proxy/catalog21',
        order: 1,
    },
];
// same as one, but with user modifiable properties changed (order, alpha, show)
var exampleProviders2 = [
    {
        proxyEnabled: true,
        withCredentials: false,
        alpha: 0.7,
        name: 'World Imagery - 3',
        show: false,
        type: 'AGM',
        parameters: {
            transparent: true,
            format: 'image/png',
        },
        url: './proxy/catalog21',
        order: 0,
    },
    {
        proxyEnabled: true,
        withCredentials: false,
        alpha: 0.7,
        name: 'World Topo Map - 1',
        show: true,
        type: 'AGM',
        parameters: {
            transparent: true,
            format: 'image/png',
        },
        url: './proxy/catalog20',
        order: 1,
    },
];
// same as one, but with one layer removed
var exampleProviders3 = [
    {
        proxyEnabled: true,
        withCredentials: false,
        alpha: 1,
        name: 'World Topo Map - 1',
        show: true,
        type: 'AGM',
        parameters: {
            transparent: true,
            format: 'image/png',
        },
        url: './proxy/catalog20',
        order: 0,
    },
];
describe('user preferences and such are handled correctly', function () {
    it('should overwrite user layers if none exist', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.imageryProviders = exampleProviders1;
        }
        var userLayers = user.get('user>preferences>mapLayers');
        userLayers.reset([]);
        expect(userLayers
            .toJSON()
            .map(function (layer) { return _.omit(layer, userModifiableLayerProperties); })).to.deep.equal(exampleProviders1.map(function (layer) {
            return _.omit(layer, userModifiableLayerProperties);
        }));
    });
    it('should leave user layers alone if the configuration has not updated', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.imageryProviders = exampleProviders1;
        }
        var userLayers = user.get('user>preferences>mapLayers');
        userLayers.reset(exampleProviders2);
        expect(userLayers
            .toJSON()
            .map(function (layer) { return _.omit(layer, userModifiableLayerProperties); })).to.deep.equal(exampleProviders2.map(function (layer) {
            return _.omit(layer, userModifiableLayerProperties);
        }));
    });
    it('should remove layers that have been removed', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.imageryProviders = exampleProviders3;
        }
        var userLayers = user.get('user>preferences>mapLayers');
        userLayers.reset(exampleProviders1);
        expect(userLayers
            .toJSON()
            .map(function (layer) { return _.omit(layer, userModifiableLayerProperties); })).to.deep.equal(exampleProviders3.map(function (layer) {
            return _.omit(layer, userModifiableLayerProperties);
        }));
    });
    it('should add layers that have been added', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.imageryProviders = exampleProviders1;
        }
        var userLayers = user.get('user>preferences>mapLayers');
        userLayers.reset(exampleProviders3);
        expect(userLayers
            .toJSON()
            .map(function (layer) { return _.omit(layer, userModifiableLayerProperties); })).to.deep.equal(exampleProviders1.map(function (layer) {
            return _.omit(layer, userModifiableLayerProperties);
        }));
    });
    it('should handle empty imagery providers', function () {
        if (StartupDataStore.Configuration.config) {
            StartupDataStore.Configuration.config.imageryProviders = [];
        }
        var userLayers = user.get('user>preferences>mapLayers');
        userLayers.reset(exampleProviders3);
        expect(userLayers
            .toJSON()
            .map(function (layer) { return _.omit(layer, userModifiableLayerProperties); })).to.deep.equal([].map(function (layer) { return _.omit(layer, userModifiableLayerProperties); }));
    });
});
//# sourceMappingURL=User.spec.js.map