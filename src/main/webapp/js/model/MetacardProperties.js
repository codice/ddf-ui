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
import Backbone from 'backbone';
import _ from 'underscore';
import * as TurfMeta from '@turf/meta';
import wkx from 'wkx';
import 'backbone-associations';
import { StartupDataStore } from './Startup/startup';
export default Backbone.AssociatedModel.extend({
    type: 'metacard-properties',
    defaults: function () {
        return {
            'metacard-tags': ['resource'],
        };
    },
    hasGeometry: function (attribute) {
        return (_.filter(this.toJSON(), function (_value, key) {
            return (attribute === undefined || attribute === key) &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key] &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key].type ===
                    'GEOMETRY';
        }).length > 0);
    },
    getCombinedGeoJSON: function () {
        return;
    },
    getPoints: function (attribute) {
        try {
            return this.getGeometries(attribute).reduce(function (pointArray, wkt) {
                return pointArray.concat(
                // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{}' is not assignable to paramet... Remove this comment to see the full error message
                TurfMeta.coordAll(wkx.Geometry.parse(wkt).toGeoJSON()));
            }, []);
        }
        catch (err) {
            console.error(err);
            return [];
        }
    },
    getGeometries: function (attribute) {
        return _.filter(this.toJSON(), function (_value, key) {
            return !StartupDataStore.MetacardDefinitions.isHiddenAttribute(key) &&
                (attribute === undefined || attribute === key) &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key] &&
                StartupDataStore.MetacardDefinitions.getAttributeMap()[key].type ===
                    'GEOMETRY';
        }).flat();
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YWNhcmRQcm9wZXJ0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL01ldGFjYXJkUHJvcGVydGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBRS9CLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEtBQUssUUFBUSxNQUFNLFlBQVksQ0FBQTtBQUN0QyxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFDckIsT0FBTyx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUVwRCxlQUFlLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQzdDLElBQUksRUFBRSxxQkFBcUI7SUFDM0IsUUFBUTtRQUNOLE9BQU87WUFDTCxlQUFlLEVBQUUsQ0FBQyxVQUFVLENBQUM7U0FDOUIsQ0FBQTtJQUNILENBQUM7SUFDRCxXQUFXLFlBQUMsU0FBYztRQUN4QixPQUFPLENBQ0wsQ0FBQyxDQUFDLE1BQU0sQ0FDTixJQUFJLENBQUMsTUFBTSxFQUFFLEVBQ2IsVUFBQyxNQUFNLEVBQUUsR0FBRztZQUNWLE9BQUEsQ0FBQyxTQUFTLEtBQUssU0FBUyxJQUFJLFNBQVMsS0FBSyxHQUFHLENBQUM7Z0JBQzlDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDM0QsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSTtvQkFDOUQsVUFBVTtRQUhaLENBR1ksQ0FDZixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQ2IsQ0FBQTtJQUNILENBQUM7SUFDRCxrQkFBa0I7UUFDaEIsT0FBTTtJQUNSLENBQUM7SUFDRCxTQUFTLFlBQUMsU0FBYztRQUN0QixJQUFJLENBQUM7WUFDSCxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUN6QyxVQUFDLFVBQWUsRUFBRSxHQUFRO2dCQUN4QixPQUFBLFVBQVUsQ0FBQyxNQUFNO2dCQUNmLG1KQUFtSjtnQkFDbkosUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUN2RDtZQUhELENBR0MsRUFDSCxFQUFFLENBQ0gsQ0FBQTtRQUNILENBQUM7UUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNsQixPQUFPLEVBQUUsQ0FBQTtRQUNYLENBQUM7SUFDSCxDQUFDO0lBQ0QsYUFBYSxZQUFDLFNBQWM7UUFDMUIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUNiLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFDYixVQUFDLE1BQU0sRUFBRSxHQUFHO1lBQ1YsT0FBQSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQztnQkFDNUQsQ0FBQyxTQUFTLEtBQUssU0FBUyxJQUFJLFNBQVMsS0FBSyxHQUFHLENBQUM7Z0JBQzlDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDM0QsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSTtvQkFDOUQsVUFBVTtRQUpaLENBSVksQ0FDZixDQUFDLElBQUksRUFBRSxDQUFBO0lBQ1YsQ0FBQztDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuXG5pbXBvcnQgXyBmcm9tICd1bmRlcnNjb3JlJ1xuaW1wb3J0ICogYXMgVHVyZk1ldGEgZnJvbSAnQHR1cmYvbWV0YSdcbmltcG9ydCB3a3ggZnJvbSAnd2t4J1xuaW1wb3J0ICdiYWNrYm9uZS1hc3NvY2lhdGlvbnMnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi9TdGFydHVwL3N0YXJ0dXAnXG5cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICB0eXBlOiAnbWV0YWNhcmQtcHJvcGVydGllcycsXG4gIGRlZmF1bHRzKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnbWV0YWNhcmQtdGFncyc6IFsncmVzb3VyY2UnXSxcbiAgICB9XG4gIH0sXG4gIGhhc0dlb21ldHJ5KGF0dHJpYnV0ZTogYW55KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIF8uZmlsdGVyKFxuICAgICAgICB0aGlzLnRvSlNPTigpLFxuICAgICAgICAoX3ZhbHVlLCBrZXkpID0+XG4gICAgICAgICAgKGF0dHJpYnV0ZSA9PT0gdW5kZWZpbmVkIHx8IGF0dHJpYnV0ZSA9PT0ga2V5KSAmJlxuICAgICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtrZXldICYmXG4gICAgICAgICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW2tleV0udHlwZSA9PT1cbiAgICAgICAgICAgICdHRU9NRVRSWSdcbiAgICAgICkubGVuZ3RoID4gMFxuICAgIClcbiAgfSxcbiAgZ2V0Q29tYmluZWRHZW9KU09OKCkge1xuICAgIHJldHVyblxuICB9LFxuICBnZXRQb2ludHMoYXR0cmlidXRlOiBhbnkpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0R2VvbWV0cmllcyhhdHRyaWJ1dGUpLnJlZHVjZShcbiAgICAgICAgKHBvaW50QXJyYXk6IGFueSwgd2t0OiBhbnkpID0+XG4gICAgICAgICAgcG9pbnRBcnJheS5jb25jYXQoXG4gICAgICAgICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjM0NSkgRklYTUU6IEFyZ3VtZW50IG9mIHR5cGUgJ3t9JyBpcyBub3QgYXNzaWduYWJsZSB0byBwYXJhbWV0Li4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgICAgIFR1cmZNZXRhLmNvb3JkQWxsKHdreC5HZW9tZXRyeS5wYXJzZSh3a3QpLnRvR2VvSlNPTigpKVxuICAgICAgICAgICksXG4gICAgICAgIFtdXG4gICAgICApXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgfSxcbiAgZ2V0R2VvbWV0cmllcyhhdHRyaWJ1dGU6IGFueSkge1xuICAgIHJldHVybiBfLmZpbHRlcihcbiAgICAgIHRoaXMudG9KU09OKCksXG4gICAgICAoX3ZhbHVlLCBrZXkpID0+XG4gICAgICAgICFTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuaXNIaWRkZW5BdHRyaWJ1dGUoa2V5KSAmJlxuICAgICAgICAoYXR0cmlidXRlID09PSB1bmRlZmluZWQgfHwgYXR0cmlidXRlID09PSBrZXkpICYmXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtrZXldICYmXG4gICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtrZXldLnR5cGUgPT09XG4gICAgICAgICAgJ0dFT01FVFJZJ1xuICAgICkuZmxhdCgpXG4gIH0sXG59KVxuIl19