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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL1VzZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUM3QixPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUNwRCxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sUUFBUSxDQUFBO0FBRXRELElBQU0saUJBQWlCLEdBQUc7SUFDeEI7UUFDRSxZQUFZLEVBQUUsSUFBSTtRQUNsQixlQUFlLEVBQUUsS0FBSztRQUN0QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksRUFBRSxvQkFBb0I7UUFDMUIsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsS0FBSztRQUNYLFVBQVUsRUFBRTtZQUNWLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLE1BQU0sRUFBRSxXQUFXO1NBQ3BCO1FBQ0QsR0FBRyxFQUFFLG1CQUFtQjtRQUN4QixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxZQUFZLEVBQUUsSUFBSTtRQUNsQixlQUFlLEVBQUUsS0FBSztRQUN0QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksRUFBRSxtQkFBbUI7UUFDekIsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsS0FBSztRQUNYLFVBQVUsRUFBRTtZQUNWLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLE1BQU0sRUFBRSxXQUFXO1NBQ3BCO1FBQ0QsR0FBRyxFQUFFLG1CQUFtQjtRQUN4QixLQUFLLEVBQUUsQ0FBQztLQUNUO0NBQ0YsQ0FBQTtBQUVELGdGQUFnRjtBQUNoRixJQUFNLGlCQUFp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dCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCB7IGV4cGVjdCB9IGZyb20gJ2NoYWknXG5pbXBvcnQgdXNlciBmcm9tICcuLi8uLi9jb21wb25lbnQvc2luZ2xldG9ucy91c2VyLWluc3RhbmNlJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vU3RhcnR1cC9zdGFydHVwJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCB7IHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzIH0gZnJvbSAnLi9Vc2VyJ1xuXG5jb25zdCBleGFtcGxlUHJvdmlkZXJzMSA9IFtcbiAge1xuICAgIHByb3h5RW5hYmxlZDogdHJ1ZSxcbiAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICAgIGFscGhhOiAxLFxuICAgIG5hbWU6ICdXb3JsZCBUb3BvIE1hcCAtIDEnLFxuICAgIHNob3c6IHRydWUsXG4gICAgdHlwZTogJ0FHTScsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICBmb3JtYXQ6ICdpbWFnZS9wbmcnLFxuICAgIH0sXG4gICAgdXJsOiAnLi9wcm94eS9jYXRhbG9nMjAnLFxuICAgIG9yZGVyOiAwLFxuICB9LFxuICB7XG4gICAgcHJveHlFbmFibGVkOiB0cnVlLFxuICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gICAgYWxwaGE6IDEsXG4gICAgbmFtZTogJ1dvcmxkIEltYWdlcnkgLSAzJyxcbiAgICBzaG93OiB0cnVlLFxuICAgIHR5cGU6ICdBR00nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgZm9ybWF0OiAnaW1hZ2UvcG5nJyxcbiAgICB9LFxuICAgIHVybDogJy4vcHJveHkvY2F0YWxvZzIxJyxcbiAgICBvcmRlcjogMSxcbiAgfSxcbl1cblxuLy8gc2FtZSBhcyBvbmUsIGJ1dCB3aXRoIHVzZXIgbW9kaWZpYWJsZSBwcm9wZXJ0aWVzIGNoYW5nZWQgKG9yZGVyLCBhbHBoYSwgc2hvdylcbmNvbnN0IGV4YW1wbGVQcm92aWRlcnMyID0gW1xuICB7XG4gICAgcHJveHlFbmFibGVkOiB0cnVlLFxuICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gICAgYWxwaGE6IDAuNyxcbiAgICBuYW1lOiAnV29ybGQgSW1hZ2VyeSAtIDMnLFxuICAgIHNob3c6IGZhbHNlLFxuICAgIHR5cGU6ICdBR00nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgZm9ybWF0OiAnaW1hZ2UvcG5nJyxcbiAgICB9LFxuICAgIHVybDogJy4vcHJveHkvY2F0YWxvZzIxJyxcbiAgICBvcmRlcjogMCxcbiAgfSxcbiAge1xuICAgIHByb3h5RW5hYmxlZDogdHJ1ZSxcbiAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICAgIGFscGhhOiAwLjcsXG4gICAgbmFtZTogJ1dvcmxkIFRvcG8gTWFwIC0gMScsXG4gICAgc2hvdzogdHJ1ZSxcbiAgICB0eXBlOiAnQUdNJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgfSxcbiAgICB1cmw6ICcuL3Byb3h5L2NhdGFsb2cyMCcsXG4gICAgb3JkZXI6IDEsXG4gIH0sXG5dXG5cbi8vIHNhbWUgYXMgb25lLCBidXQgd2l0aCBvbmUgbGF5ZXIgcmVtb3ZlZFxuY29uc3QgZXhhbXBsZVByb3ZpZGVyczMgPSBbXG4gIHtcbiAgICBwcm94eUVuYWJsZWQ6IHRydWUsXG4gICAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZSxcbiAgICBhbHBoYTogMSxcbiAgICBuYW1lOiAnV29ybGQgVG9wbyBNYXAgLSAxJyxcbiAgICBzaG93OiB0cnVlLFxuICAgIHR5cGU6ICdBR00nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgZm9ybWF0OiAnaW1hZ2UvcG5nJyxcbiAgICB9LFxuICAgIHVybDogJy4vcHJveHkvY2F0YWxvZzIwJyxcbiAgICBvcmRlcjogMCxcbiAgfSxcbl1cblxuZGVzY3JpYmUoJ3VzZXIgcHJlZmVyZW5jZXMgYW5kIHN1Y2ggYXJlIGhhbmRsZWQgY29ycmVjdGx5JywgKCkgPT4ge1xuICBpdCgnc2hvdWxkIG92ZXJ3cml0ZSB1c2VyIGxheWVycyBpZiBub25lIGV4aXN0JywgKCkgPT4ge1xuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnKSB7XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnLmltYWdlcnlQcm92aWRlcnMgPSBleGFtcGxlUHJvdmlkZXJzMVxuICAgIH1cbiAgICBjb25zdCB1c2VyTGF5ZXJzID0gdXNlci5nZXQoJ3VzZXI+cHJlZmVyZW5jZXM+bWFwTGF5ZXJzJylcbiAgICB1c2VyTGF5ZXJzLnJlc2V0KFtdKVxuXG4gICAgZXhwZWN0KFxuICAgICAgdXNlckxheWVyc1xuICAgICAgICAudG9KU09OKClcbiAgICAgICAgLm1hcCgobGF5ZXI6IGFueSkgPT4gXy5vbWl0KGxheWVyLCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcykpXG4gICAgKS50by5kZWVwLmVxdWFsKFxuICAgICAgZXhhbXBsZVByb3ZpZGVyczEubWFwKChsYXllcikgPT5cbiAgICAgICAgXy5vbWl0KGxheWVyLCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcylcbiAgICAgIClcbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBsZWF2ZSB1c2VyIGxheWVycyBhbG9uZSBpZiB0aGUgY29uZmlndXJhdGlvbiBoYXMgbm90IHVwZGF0ZWQnLCAoKSA9PiB7XG4gICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcpIHtcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcuaW1hZ2VyeVByb3ZpZGVycyA9IGV4YW1wbGVQcm92aWRlcnMxXG4gICAgfVxuICAgIGNvbnN0IHVzZXJMYXllcnMgPSB1c2VyLmdldCgndXNlcj5wcmVmZXJlbmNlcz5tYXBMYXllcnMnKVxuICAgIHVzZXJMYXllcnMucmVzZXQoZXhhbXBsZVByb3ZpZGVyczIpXG5cbiAgICBleHBlY3QoXG4gICAgICB1c2VyTGF5ZXJzXG4gICAgICAgIC50b0pTT04oKVxuICAgICAgICAubWFwKChsYXllcjogYW55KSA9PiBfLm9taXQobGF5ZXIsIHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzKSlcbiAgICApLnRvLmRlZXAuZXF1YWwoXG4gICAgICBleGFtcGxlUHJvdmlkZXJzMi5tYXAoKGxheWVyKSA9PlxuICAgICAgICBfLm9taXQobGF5ZXIsIHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzKVxuICAgICAgKVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIHJlbW92ZSBsYXllcnMgdGhhdCBoYXZlIGJlZW4gcmVtb3ZlZCcsICgpID0+IHtcbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZykge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZy5pbWFnZXJ5UHJvdmlkZXJzID0gZXhhbXBsZVByb3ZpZGVyczNcbiAgICB9XG4gICAgY29uc3QgdXNlckxheWVycyA9IHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzPm1hcExheWVycycpXG4gICAgdXNlckxheWVycy5yZXNldChleGFtcGxlUHJvdmlkZXJzMSlcblxuICAgIGV4cGVjdChcbiAgICAgIHVzZXJMYXllcnNcbiAgICAgICAgLnRvSlNPTigpXG4gICAgICAgIC5tYXAoKGxheWVyOiBhbnkpID0+IF8ub21pdChsYXllciwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpKVxuICAgICkudG8uZGVlcC5lcXVhbChcbiAgICAgIGV4YW1wbGVQcm92aWRlcnMzLm1hcCgobGF5ZXIpID0+XG4gICAgICAgIF8ub21pdChsYXllciwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpXG4gICAgICApXG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgYWRkIGxheWVycyB0aGF0IGhhdmUgYmVlbiBhZGRlZCcsICgpID0+IHtcbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZykge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZy5pbWFnZXJ5UHJvdmlkZXJzID0gZXhhbXBsZVByb3ZpZGVyczFcbiAgICB9XG4gICAgY29uc3QgdXNlckxheWVycyA9IHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzPm1hcExheWVycycpXG4gICAgdXNlckxheWVycy5yZXNldChleGFtcGxlUHJvdmlkZXJzMylcblxuICAgIGV4cGVjdChcbiAgICAgIHVzZXJMYXllcnNcbiAgICAgICAgLnRvSlNPTigpXG4gICAgICAgIC5tYXAoKGxheWVyOiBhbnkpID0+IF8ub21pdChsYXllciwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpKVxuICAgICkudG8uZGVlcC5lcXVhbChcbiAgICAgIGV4YW1wbGVQcm92aWRlcnMxLm1hcCgobGF5ZXIpID0+XG4gICAgICAgIF8ub21pdChsYXllciwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpXG4gICAgICApXG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgaGFuZGxlIGVtcHR5IGltYWdlcnkgcHJvdmlkZXJzJywgKCkgPT4ge1xuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnKSB7XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnLmltYWdlcnlQcm92aWRlcnMgPSBbXVxuICAgIH1cbiAgICBjb25zdCB1c2VyTGF5ZXJzID0gdXNlci5nZXQoJ3VzZXI+cHJlZmVyZW5jZXM+bWFwTGF5ZXJzJylcbiAgICB1c2VyTGF5ZXJzLnJlc2V0KGV4YW1wbGVQcm92aWRlcnMzKVxuXG4gICAgZXhwZWN0KFxuICAgICAgdXNlckxheWVyc1xuICAgICAgICAudG9KU09OKClcbiAgICAgICAgLm1hcCgobGF5ZXI6IGFueSkgPT4gXy5vbWl0KGxheWVyLCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcykpXG4gICAgKS50by5kZWVwLmVxdWFsKFxuICAgICAgW10ubWFwKChsYXllcikgPT4gXy5vbWl0KGxheWVyLCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcykpXG4gICAgKVxuICB9KVxufSlcbiJdfQ==