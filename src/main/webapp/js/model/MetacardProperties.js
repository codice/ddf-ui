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
        });
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YWNhcmRQcm9wZXJ0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2pzL21vZGVsL01ldGFjYXJkUHJvcGVydGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQWFJO0FBQ0osT0FBTyxRQUFRLE1BQU0sVUFBVSxDQUFBO0FBRS9CLE9BQU8sQ0FBQyxNQUFNLFlBQVksQ0FBQTtBQUMxQixPQUFPLEtBQUssUUFBUSxNQUFNLFlBQVksQ0FBQTtBQUN0QyxPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFDckIsT0FBTyx1QkFBdUIsQ0FBQTtBQUM5QixPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUVwRCxlQUFlLFFBQVEsQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDO0lBQzdDLElBQUksRUFBRSxxQkFBcUI7SUFDM0IsUUFBUTtRQUNOLE9BQU87WUFDTCxlQUFlLEVBQUUsQ0FBQyxVQUFVLENBQUM7U0FDOUIsQ0FBQTtJQUNILENBQUM7SUFDRCxXQUFXLFlBQUMsU0FBYztRQUN4QixPQUFPLENBQ0wsQ0FBQyxDQUFDLE1BQU0sQ0FDTixJQUFJLENBQUMsTUFBTSxFQUFFLEVBQ2IsVUFBQyxNQUFNLEVBQUUsR0FBRztZQUNWLE9BQUEsQ0FBQyxTQUFTLEtBQUssU0FBUyxJQUFJLFNBQVMsS0FBSyxHQUFHLENBQUM7Z0JBQzlDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQztnQkFDM0QsZ0JBQWdCLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSTtvQkFDOUQsVUFBVTtRQUhaLENBR1ksQ0FDZixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQ2IsQ0FBQTtJQUNILENBQUM7SUFDRCxrQkFBa0I7UUFDaEIsT0FBTTtJQUNSLENBQUM7SUFDRCxTQUFTLFlBQUMsU0FBYztRQUN0QixJQUFJO1lBQ0YsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE1BQU0sQ0FDekMsVUFBQyxVQUFlLEVBQUUsR0FBUTtnQkFDeEIsT0FBQSxVQUFVLENBQUMsTUFBTTtnQkFDZixtSkFBbUo7Z0JBQ25KLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FDdkQ7WUFIRCxDQUdDLEVBQ0gsRUFBRSxDQUNILENBQUE7U0FDRjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNsQixPQUFPLEVBQUUsQ0FBQTtTQUNWO0lBQ0gsQ0FBQztJQUNELGFBQWEsWUFBQyxTQUFjO1FBQzFCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FDYixJQUFJLENBQUMsTUFBTSxFQUFFLEVBQ2IsVUFBQyxNQUFNLEVBQUUsR0FBRztZQUNWLE9BQUEsQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUM7Z0JBQzVELENBQUMsU0FBUyxLQUFLLFNBQVMsSUFBSSxTQUFTLEtBQUssR0FBRyxDQUFDO2dCQUM5QyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxHQUFHLENBQUM7Z0JBQzNELGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUk7b0JBQzlELFVBQVU7UUFKWixDQUlZLENBQ2YsQ0FBQTtJQUNILENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcblxuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZSdcbmltcG9ydCAqIGFzIFR1cmZNZXRhIGZyb20gJ0B0dXJmL21ldGEnXG5pbXBvcnQgd2t4IGZyb20gJ3dreCdcbmltcG9ydCAnYmFja2JvbmUtYXNzb2NpYXRpb25zJ1xuaW1wb3J0IHsgU3RhcnR1cERhdGFTdG9yZSB9IGZyb20gJy4vU3RhcnR1cC9zdGFydHVwJ1xuXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgdHlwZTogJ21ldGFjYXJkLXByb3BlcnRpZXMnLFxuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJ21ldGFjYXJkLXRhZ3MnOiBbJ3Jlc291cmNlJ10sXG4gICAgfVxuICB9LFxuICBoYXNHZW9tZXRyeShhdHRyaWJ1dGU6IGFueSkge1xuICAgIHJldHVybiAoXG4gICAgICBfLmZpbHRlcihcbiAgICAgICAgdGhpcy50b0pTT04oKSxcbiAgICAgICAgKF92YWx1ZSwga2V5KSA9PlxuICAgICAgICAgIChhdHRyaWJ1dGUgPT09IHVuZGVmaW5lZCB8fCBhdHRyaWJ1dGUgPT09IGtleSkgJiZcbiAgICAgICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClba2V5XSAmJlxuICAgICAgICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtrZXldLnR5cGUgPT09XG4gICAgICAgICAgICAnR0VPTUVUUlknXG4gICAgICApLmxlbmd0aCA+IDBcbiAgICApXG4gIH0sXG4gIGdldENvbWJpbmVkR2VvSlNPTigpIHtcbiAgICByZXR1cm5cbiAgfSxcbiAgZ2V0UG9pbnRzKGF0dHJpYnV0ZTogYW55KSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0aGlzLmdldEdlb21ldHJpZXMoYXR0cmlidXRlKS5yZWR1Y2UoXG4gICAgICAgIChwb2ludEFycmF5OiBhbnksIHdrdDogYW55KSA9PlxuICAgICAgICAgIHBvaW50QXJyYXkuY29uY2F0KFxuICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDIzNDUpIEZJWE1FOiBBcmd1bWVudCBvZiB0eXBlICd7fScgaXMgbm90IGFzc2lnbmFibGUgdG8gcGFyYW1ldC4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG4gICAgICAgICAgICBUdXJmTWV0YS5jb29yZEFsbCh3a3guR2VvbWV0cnkucGFyc2Uod2t0KS50b0dlb0pTT04oKSlcbiAgICAgICAgICApLFxuICAgICAgICBbXVxuICAgICAgKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpXG4gICAgICByZXR1cm4gW11cbiAgICB9XG4gIH0sXG4gIGdldEdlb21ldHJpZXMoYXR0cmlidXRlOiBhbnkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoXG4gICAgICB0aGlzLnRvSlNPTigpLFxuICAgICAgKF92YWx1ZSwga2V5KSA9PlxuICAgICAgICAhU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmlzSGlkZGVuQXR0cmlidXRlKGtleSkgJiZcbiAgICAgICAgKGF0dHJpYnV0ZSA9PT0gdW5kZWZpbmVkIHx8IGF0dHJpYnV0ZSA9PT0ga2V5KSAmJlxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClba2V5XSAmJlxuICAgICAgICBTdGFydHVwRGF0YVN0b3JlLk1ldGFjYXJkRGVmaW5pdGlvbnMuZ2V0QXR0cmlidXRlTWFwKClba2V5XS50eXBlID09PVxuICAgICAgICAgICdHRU9NRVRSWSdcbiAgICApXG4gIH0sXG59KVxuIl19