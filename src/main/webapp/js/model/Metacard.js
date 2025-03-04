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
import 'backbone-associations';
import MetacardPropertiesModel from './MetacardProperties';
export default Backbone.AssociatedModel.extend({
    hasGeometry: function (attribute) {
        return this.get('properties').hasGeometry(attribute);
    },
    getPoints: function (attribute) {
        return this.get('properties').getPoints(attribute);
    },
    getGeometries: function (attribute) {
        return this.get('properties').getGeometries(attribute);
    },
    relations: [
        {
            type: Backbone.One,
            key: 'properties',
            relatedModel: MetacardPropertiesModel,
        },
    ],
    defaults: {
        queryId: undefined,
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YWNhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvTWV0YWNhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUUvQixPQUFPLHVCQUF1QixDQUFBO0FBQzlCLE9BQU8sdUJBQXVCLE1BQU0sc0JBQXNCLENBQUE7QUFFMUQsZUFBZSxRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUM3QyxXQUFXLFlBQUMsU0FBYztRQUN4QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3RELENBQUM7SUFDRCxTQUFTLFlBQUMsU0FBYztRQUN0QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFDRCxhQUFhLFlBQUMsU0FBYztRQUMxQixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFBO0lBQ3hELENBQUM7SUFDRCxTQUFTLEVBQUU7UUFDVDtZQUNFLElBQUksRUFBRSxRQUFRLENBQUMsR0FBRztZQUNsQixHQUFHLEVBQUUsWUFBWTtZQUNqQixZQUFZLEVBQUUsdUJBQXVCO1NBQ3RDO0tBQ0Y7SUFDRCxRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUUsU0FBUztLQUNuQjtDQUNGLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IEJhY2tib25lIGZyb20gJ2JhY2tib25lJ1xuXG5pbXBvcnQgJ2JhY2tib25lLWFzc29jaWF0aW9ucydcbmltcG9ydCBNZXRhY2FyZFByb3BlcnRpZXNNb2RlbCBmcm9tICcuL01ldGFjYXJkUHJvcGVydGllcydcblxuZXhwb3J0IGRlZmF1bHQgQmFja2JvbmUuQXNzb2NpYXRlZE1vZGVsLmV4dGVuZCh7XG4gIGhhc0dlb21ldHJ5KGF0dHJpYnV0ZTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwcm9wZXJ0aWVzJykuaGFzR2VvbWV0cnkoYXR0cmlidXRlKVxuICB9LFxuICBnZXRQb2ludHMoYXR0cmlidXRlOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ3Byb3BlcnRpZXMnKS5nZXRQb2ludHMoYXR0cmlidXRlKVxuICB9LFxuICBnZXRHZW9tZXRyaWVzKGF0dHJpYnV0ZTogYW55KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdwcm9wZXJ0aWVzJykuZ2V0R2VvbWV0cmllcyhhdHRyaWJ1dGUpXG4gIH0sXG4gIHJlbGF0aW9uczogW1xuICAgIHtcbiAgICAgIHR5cGU6IEJhY2tib25lLk9uZSxcbiAgICAgIGtleTogJ3Byb3BlcnRpZXMnLFxuICAgICAgcmVsYXRlZE1vZGVsOiBNZXRhY2FyZFByb3BlcnRpZXNNb2RlbCxcbiAgICB9LFxuICBdLFxuICBkZWZhdWx0czoge1xuICAgIHF1ZXJ5SWQ6IHVuZGVmaW5lZCxcbiAgfSxcbn0pXG4iXX0=