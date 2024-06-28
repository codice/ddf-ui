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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXNlci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL1VzZXIuc3BlYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQTtBQUM3QixPQUFPLElBQUksTUFBTSwwQ0FBMEMsQ0FBQTtBQUMzRCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUNwRCxPQUFPLENBQUMsTUFBTSxZQUFZLENBQUE7QUFDMUIsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sUUFBUSxDQUFBO0FBRXRELElBQU0saUJBQWlCLEdBQUc7SUFDeEI7UUFDRSxZQUFZLEVBQUUsSUFBSTtRQUNsQixlQUFlLEVBQUUsS0FBSztRQUN0QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksRUFBRSxvQkFBb0I7UUFDMUIsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsS0FBSztRQUNYLFVBQVUsRUFBRTtZQUNWLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLE1BQU0sRUFBRSxXQUFXO1NBQ3BCO1FBQ0QsR0FBRyxFQUFFLG1CQUFtQjtRQUN4QixLQUFLLEVBQUUsQ0FBQztLQUNUO0lBQ0Q7UUFDRSxZQUFZLEVBQUUsSUFBSTtRQUNsQixlQUFlLEVBQUUsS0FBSztRQUN0QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksRUFBRSxtQkFBbUI7UUFDekIsSUFBSSxFQUFFLElBQUk7UUFDVixJQUFJLEVBQUUsS0FBSztRQUNYLFVBQVUsRUFBRTtZQUNWLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLE1BQU0sRUFBRSxXQUFXO1NBQ3BCO1FBQ0QsR0FBRyxFQUFFLG1CQUFtQjtRQUN4QixLQUFLLEVBQUUsQ0FBQztLQUNUO0NBQ0YsQ0FBQTtBQUVELGdGQUFnRjtBQUNoRixJQUFNLGlCQUFpQixHQUFHO0lBQ3hCO1FBQ0UsWUFBWSxFQUFFLElBQUk7UUFDbEIsZUFBZSxFQUFFLEtBQUs7UUFDdEIsS0FBSyxFQUFFLEdBQUc7UUFDVixJQUFJLEVBQUUsbUJBQW1CO1FBQ3pCLElBQUksRUFBRSxLQUFLO1FBQ1gsSUFBSSxFQUFFLEtBQUs7UUFDWCxVQUFVLEVBQUU7WUFDVixXQUFXLEVBQUUsSUFBSTtZQUNqQixNQUFNLEVBQUUsV0FBVztTQUNwQjtRQUNELEdBQUcsRUFBRSxtQkFBbUI7UUFDeEIsS0FBSyxFQUFFLENBQUM7S0FDVDtJQUNEO1FBQ0UsWUFBWSxFQUFFLElBQUk7UUFDbEIsZUFBZSxFQUFFLEtBQUs7UUFDdEIsS0FBSyxFQUFFLEdBQUc7UUFDVixJQUFJLEVBQUUsb0JBQW9CO1FBQzFCLElBQUksRUFBRSxJQUFJO1FBQ1YsSUFBSSxFQUFFLEtBQUs7UUFDWCxVQUFVLEVBQUU7WUFDVixXQUFXLEVBQUUsSUFBSTtZQUNqQixNQUFNLEVBQUUsV0FBVztTQUNwQjtRQUNELEdBQUcsRUFBRSxtQkFBbUI7UUFDeEIsS0FBSyxFQUFFLENBQUM7S0FDVDtDQUNGLENBQUE7QUFFRCwwQ0FBMEM7QUFDMUMsSUFBTSxpQkFBaUIsR0FBRztJQUN4QjtRQUNFLFlBQVksRUFBRSxJQUFJO1FBQ2xCLGVBQWUsRUFBRSxLQUFLO1FBQ3RCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxFQUFFLG9CQUFvQjtRQUMxQixJQUFJLEVBQUUsSUFBSTtRQUNWLElBQUksRUFBRSxLQUFLO1FBQ1gsVUFBVSxFQUFFO1lBQ1YsV0FBVyxFQUFFLElBQUk7WUFDakIsTUFBTSxFQUFFLFdBQVc7U0FDcEI7UUFDRCxHQUFHLEVBQUUsbUJBQW1CO1FBQ3hCLEtBQUssRUFBRSxDQUFDO0tBQ1Q7Q0FDRixDQUFBO0FBRUQsUUFBUSxDQUFDLGlEQUFpRCxFQUFFO0lBQzFELEVBQUUsQ0FBQyw0Q0FBNEMsRUFBRTtRQUMvQyxJQUFJLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDekMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQTtTQUMzRTtRQUNELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtRQUN6RCxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBRXBCLE1BQU0sQ0FDSixVQUFVO2FBQ1AsTUFBTSxFQUFFO2FBQ1IsR0FBRyxDQUFDLFVBQUMsS0FBVSxJQUFLLE9BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsNkJBQTZCLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUNyRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUNiLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUs7WUFDMUIsT0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSw2QkFBNkIsQ0FBQztRQUE1QyxDQUE0QyxDQUM3QyxDQUNGLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyxxRUFBcUUsRUFBRTtRQUN4RSxJQUFJLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDekMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxpQkFBaUIsQ0FBQTtTQUMzRTtRQUNELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsQ0FBQTtRQUN6RCxVQUFVLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUE7UUFFbkMsTUFBTSxDQUNKLFVBQVU7YUFDUCxNQUFNLEVBQUU7YUFDUixHQUFHLENBQUMsVUFBQyxLQUFVLElBQUssT0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSw2QkFBNkIsQ0FBQyxFQUE1QyxDQUE0QyxDQUFDLENBQ3JFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQ2IsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFVBQUMsS0FBSztZQUMxQixPQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLDZCQUE2QixDQUFDO1FBQTVDLENBQTRDLENBQzdDLENBQ0YsQ0FBQTtJQUNILENBQUMsQ0FBQyxDQUFBO0lBRUYsRUFBRSxDQUFDLDZDQUE2QyxFQUFFO1FBQ2hELElBQUksZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sRUFBRTtZQUN6QyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixDQUFBO1NBQzNFO1FBQ0QsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFBO1FBQ3pELFVBQVUsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQTtRQUVuQyxNQUFNLENBQ0osVUFBVTthQUNQLE1BQU0sRUFBRTthQUNSLEdBQUcsQ0FBQyxVQUFDLEtBQVUsSUFBSyxPQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLDZCQUE2QixDQUFDLEVBQTVDLENBQTRDLENBQUMsQ0FDckUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FDYixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLO1lBQzFCLE9BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsNkJBQTZCLENBQUM7UUFBNUMsQ0FBNEMsQ0FDN0MsQ0FDRixDQUFBO0lBQ0gsQ0FBQyxDQUFDLENBQUE7SUFFRixFQUFFLENBQUMsd0NBQXdDLEVBQUU7UUFDM0MsSUFBSSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3pDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUE7U0FDM0U7UUFDRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUE7UUFDekQsVUFBVSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBRW5DLE1BQU0sQ0FDSixVQUFVO2FBQ1AsTUFBTSxFQUFFO2FBQ1IsR0FBRyxDQUFDLFVBQUMsS0FBVSxJQUFLLE9BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsNkJBQTZCLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUNyRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUNiLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUs7WUFDMUIsT0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSw2QkFBNkIsQ0FBQztRQUE1QyxDQUE0QyxDQUM3QyxDQUNGLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtJQUVGLEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRTtRQUMxQyxJQUFJLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7WUFDekMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUE7U0FDNUQ7UUFDRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUE7UUFDekQsVUFBVSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFBO1FBRW5DLE1BQU0sQ0FDSixVQUFVO2FBQ1AsTUFBTSxFQUFFO2FBQ1IsR0FBRyxDQUFDLFVBQUMsS0FBVSxJQUFLLE9BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsNkJBQTZCLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxDQUNyRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUNiLEVBQUUsQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLLElBQUssT0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSw2QkFBNkIsQ0FBQyxFQUE1QyxDQUE0QyxDQUFDLENBQ2hFLENBQUE7SUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICdjaGFpJ1xuaW1wb3J0IHVzZXIgZnJvbSAnLi4vLi4vY29tcG9uZW50L3NpbmdsZXRvbnMvdXNlci1pbnN0YW5jZSdcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuL1N0YXJ0dXAvc3RhcnR1cCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUnXG5pbXBvcnQgeyB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcyB9IGZyb20gJy4vVXNlcidcblxuY29uc3QgZXhhbXBsZVByb3ZpZGVyczEgPSBbXG4gIHtcbiAgICBwcm94eUVuYWJsZWQ6IHRydWUsXG4gICAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZSxcbiAgICBhbHBoYTogMSxcbiAgICBuYW1lOiAnV29ybGQgVG9wbyBNYXAgLSAxJyxcbiAgICBzaG93OiB0cnVlLFxuICAgIHR5cGU6ICdBR00nLFxuICAgIHBhcmFtZXRlcnM6IHtcbiAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgZm9ybWF0OiAnaW1hZ2UvcG5nJyxcbiAgICB9LFxuICAgIHVybDogJy4vcHJveHkvY2F0YWxvZzIwJyxcbiAgICBvcmRlcjogMCxcbiAgfSxcbiAge1xuICAgIHByb3h5RW5hYmxlZDogdHJ1ZSxcbiAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICAgIGFscGhhOiAxLFxuICAgIG5hbWU6ICdXb3JsZCBJbWFnZXJ5IC0gMycsXG4gICAgc2hvdzogdHJ1ZSxcbiAgICB0eXBlOiAnQUdNJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgfSxcbiAgICB1cmw6ICcuL3Byb3h5L2NhdGFsb2cyMScsXG4gICAgb3JkZXI6IDEsXG4gIH0sXG5dXG5cbi8vIHNhbWUgYXMgb25lLCBidXQgd2l0aCB1c2VyIG1vZGlmaWFibGUgcHJvcGVydGllcyBjaGFuZ2VkIChvcmRlciwgYWxwaGEsIHNob3cpXG5jb25zdCBleGFtcGxlUHJvdmlkZXJzMiA9IFtcbiAge1xuICAgIHByb3h5RW5hYmxlZDogdHJ1ZSxcbiAgICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICAgIGFscGhhOiAwLjcsXG4gICAgbmFtZTogJ1dvcmxkIEltYWdlcnkgLSAzJyxcbiAgICBzaG93OiBmYWxzZSxcbiAgICB0eXBlOiAnQUdNJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgfSxcbiAgICB1cmw6ICcuL3Byb3h5L2NhdGFsb2cyMScsXG4gICAgb3JkZXI6IDAsXG4gIH0sXG4gIHtcbiAgICBwcm94eUVuYWJsZWQ6IHRydWUsXG4gICAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZSxcbiAgICBhbHBoYTogMC43LFxuICAgIG5hbWU6ICdXb3JsZCBUb3BvIE1hcCAtIDEnLFxuICAgIHNob3c6IHRydWUsXG4gICAgdHlwZTogJ0FHTScsXG4gICAgcGFyYW1ldGVyczoge1xuICAgICAgdHJhbnNwYXJlbnQ6IHRydWUsXG4gICAgICBmb3JtYXQ6ICdpbWFnZS9wbmcnLFxuICAgIH0sXG4gICAgdXJsOiAnLi9wcm94eS9jYXRhbG9nMjAnLFxuICAgIG9yZGVyOiAxLFxuICB9LFxuXVxuXG4vLyBzYW1lIGFzIG9uZSwgYnV0IHdpdGggb25lIGxheWVyIHJlbW92ZWRcbmNvbnN0IGV4YW1wbGVQcm92aWRlcnMzID0gW1xuICB7XG4gICAgcHJveHlFbmFibGVkOiB0cnVlLFxuICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gICAgYWxwaGE6IDEsXG4gICAgbmFtZTogJ1dvcmxkIFRvcG8gTWFwIC0gMScsXG4gICAgc2hvdzogdHJ1ZSxcbiAgICB0eXBlOiAnQUdNJyxcbiAgICBwYXJhbWV0ZXJzOiB7XG4gICAgICB0cmFuc3BhcmVudDogdHJ1ZSxcbiAgICAgIGZvcm1hdDogJ2ltYWdlL3BuZycsXG4gICAgfSxcbiAgICB1cmw6ICcuL3Byb3h5L2NhdGFsb2cyMCcsXG4gICAgb3JkZXI6IDAsXG4gIH0sXG5dXG5cbmRlc2NyaWJlKCd1c2VyIHByZWZlcmVuY2VzIGFuZCBzdWNoIGFyZSBoYW5kbGVkIGNvcnJlY3RseScsICgpID0+IHtcbiAgaXQoJ3Nob3VsZCBvdmVyd3JpdGUgdXNlciBsYXllcnMgaWYgbm9uZSBleGlzdCcsICgpID0+IHtcbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZykge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZy5pbWFnZXJ5UHJvdmlkZXJzID0gZXhhbXBsZVByb3ZpZGVyczFcbiAgICB9XG4gICAgY29uc3QgdXNlckxheWVycyA9IHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzPm1hcExheWVycycpXG4gICAgdXNlckxheWVycy5yZXNldChbXSlcblxuICAgIGV4cGVjdChcbiAgICAgIHVzZXJMYXllcnNcbiAgICAgICAgLnRvSlNPTigpXG4gICAgICAgIC5tYXAoKGxheWVyOiBhbnkpID0+IF8ub21pdChsYXllciwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpKVxuICAgICkudG8uZGVlcC5lcXVhbChcbiAgICAgIGV4YW1wbGVQcm92aWRlcnMxLm1hcCgobGF5ZXIpID0+XG4gICAgICAgIF8ub21pdChsYXllciwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpXG4gICAgICApXG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgbGVhdmUgdXNlciBsYXllcnMgYWxvbmUgaWYgdGhlIGNvbmZpZ3VyYXRpb24gaGFzIG5vdCB1cGRhdGVkJywgKCkgPT4ge1xuICAgIGlmIChTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnKSB7XG4gICAgICBTdGFydHVwRGF0YVN0b3JlLkNvbmZpZ3VyYXRpb24uY29uZmlnLmltYWdlcnlQcm92aWRlcnMgPSBleGFtcGxlUHJvdmlkZXJzMVxuICAgIH1cbiAgICBjb25zdCB1c2VyTGF5ZXJzID0gdXNlci5nZXQoJ3VzZXI+cHJlZmVyZW5jZXM+bWFwTGF5ZXJzJylcbiAgICB1c2VyTGF5ZXJzLnJlc2V0KGV4YW1wbGVQcm92aWRlcnMyKVxuXG4gICAgZXhwZWN0KFxuICAgICAgdXNlckxheWVyc1xuICAgICAgICAudG9KU09OKClcbiAgICAgICAgLm1hcCgobGF5ZXI6IGFueSkgPT4gXy5vbWl0KGxheWVyLCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcykpXG4gICAgKS50by5kZWVwLmVxdWFsKFxuICAgICAgZXhhbXBsZVByb3ZpZGVyczIubWFwKChsYXllcikgPT5cbiAgICAgICAgXy5vbWl0KGxheWVyLCB1c2VyTW9kaWZpYWJsZUxheWVyUHJvcGVydGllcylcbiAgICAgIClcbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCByZW1vdmUgbGF5ZXJzIHRoYXQgaGF2ZSBiZWVuIHJlbW92ZWQnLCAoKSA9PiB7XG4gICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcpIHtcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcuaW1hZ2VyeVByb3ZpZGVycyA9IGV4YW1wbGVQcm92aWRlcnMzXG4gICAgfVxuICAgIGNvbnN0IHVzZXJMYXllcnMgPSB1c2VyLmdldCgndXNlcj5wcmVmZXJlbmNlcz5tYXBMYXllcnMnKVxuICAgIHVzZXJMYXllcnMucmVzZXQoZXhhbXBsZVByb3ZpZGVyczEpXG5cbiAgICBleHBlY3QoXG4gICAgICB1c2VyTGF5ZXJzXG4gICAgICAgIC50b0pTT04oKVxuICAgICAgICAubWFwKChsYXllcjogYW55KSA9PiBfLm9taXQobGF5ZXIsIHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzKSlcbiAgICApLnRvLmRlZXAuZXF1YWwoXG4gICAgICBleGFtcGxlUHJvdmlkZXJzMy5tYXAoKGxheWVyKSA9PlxuICAgICAgICBfLm9taXQobGF5ZXIsIHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzKVxuICAgICAgKVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGFkZCBsYXllcnMgdGhhdCBoYXZlIGJlZW4gYWRkZWQnLCAoKSA9PiB7XG4gICAgaWYgKFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcpIHtcbiAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuQ29uZmlndXJhdGlvbi5jb25maWcuaW1hZ2VyeVByb3ZpZGVycyA9IGV4YW1wbGVQcm92aWRlcnMxXG4gICAgfVxuICAgIGNvbnN0IHVzZXJMYXllcnMgPSB1c2VyLmdldCgndXNlcj5wcmVmZXJlbmNlcz5tYXBMYXllcnMnKVxuICAgIHVzZXJMYXllcnMucmVzZXQoZXhhbXBsZVByb3ZpZGVyczMpXG5cbiAgICBleHBlY3QoXG4gICAgICB1c2VyTGF5ZXJzXG4gICAgICAgIC50b0pTT04oKVxuICAgICAgICAubWFwKChsYXllcjogYW55KSA9PiBfLm9taXQobGF5ZXIsIHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzKSlcbiAgICApLnRvLmRlZXAuZXF1YWwoXG4gICAgICBleGFtcGxlUHJvdmlkZXJzMS5tYXAoKGxheWVyKSA9PlxuICAgICAgICBfLm9taXQobGF5ZXIsIHVzZXJNb2RpZmlhYmxlTGF5ZXJQcm9wZXJ0aWVzKVxuICAgICAgKVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGhhbmRsZSBlbXB0eSBpbWFnZXJ5IHByb3ZpZGVycycsICgpID0+IHtcbiAgICBpZiAoU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZykge1xuICAgICAgU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmNvbmZpZy5pbWFnZXJ5UHJvdmlkZXJzID0gW11cbiAgICB9XG4gICAgY29uc3QgdXNlckxheWVycyA9IHVzZXIuZ2V0KCd1c2VyPnByZWZlcmVuY2VzPm1hcExheWVycycpXG4gICAgdXNlckxheWVycy5yZXNldChleGFtcGxlUHJvdmlkZXJzMylcblxuICAgIGV4cGVjdChcbiAgICAgIHVzZXJMYXllcnNcbiAgICAgICAgLnRvSlNPTigpXG4gICAgICAgIC5tYXAoKGxheWVyOiBhbnkpID0+IF8ub21pdChsYXllciwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpKVxuICAgICkudG8uZGVlcC5lcXVhbChcbiAgICAgIFtdLm1hcCgobGF5ZXIpID0+IF8ub21pdChsYXllciwgdXNlck1vZGlmaWFibGVMYXllclByb3BlcnRpZXMpKVxuICAgIClcbiAgfSlcbn0pXG4iXX0=