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
import { StartupDataStore } from './Startup/startup';
export default Backbone.Model.extend({
    defaults: function () {
        var sources = StartupDataStore.Configuration.getDefaultSources();
        return {
            type: 'text',
            sources: sources,
            sorts: [
                {
                    attribute: 'modified',
                    direction: 'descending',
                },
            ],
            template: undefined,
            spellcheck: false,
            phonetics: false,
            additionalOptions: '{}',
        };
    },
    isTemplate: function (template) {
        if (this.get('defaultResultFormId') === template.id) {
            return true;
        }
        if (this.get('template') !== undefined) {
            return this.get('template').id === template.id;
        }
        else {
            return false;
        }
    },
    isDefaultTemplate: function (template) {
        return this.isTemplate(template) && this.get('template').default;
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUXVlcnlTZXR0aW5ncy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9tb2RlbC9RdWVyeVNldHRpbmdzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFDL0IsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sbUJBQW1CLENBQUE7QUFDcEQsZUFBZSxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNuQyxRQUFRO1FBQ04sSUFBTSxPQUFPLEdBQUcsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUE7UUFDbEUsT0FBTztZQUNMLElBQUksRUFBRSxNQUFNO1lBQ1osT0FBTyxTQUFBO1lBQ1AsS0FBSyxFQUFFO2dCQUNMO29CQUNFLFNBQVMsRUFBRSxVQUFVO29CQUNyQixTQUFTLEVBQUUsWUFBWTtpQkFDeEI7YUFDRjtZQUNELFFBQVEsRUFBRSxTQUFTO1lBQ25CLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLGlCQUFpQixFQUFFLElBQUk7U0FDeEIsQ0FBQTtJQUNILENBQUM7SUFDRCxVQUFVLFlBQUMsUUFBYTtRQUN0QixJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsS0FBSyxRQUFRLENBQUMsRUFBRSxFQUFFO1lBQ25ELE9BQU8sSUFBSSxDQUFBO1NBQ1o7UUFDRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEtBQUssUUFBUSxDQUFDLEVBQUUsQ0FBQTtTQUMvQzthQUFNO1lBQ0wsT0FBTyxLQUFLLENBQUE7U0FDYjtJQUNILENBQUM7SUFDRCxpQkFBaUIsWUFBQyxRQUFhO1FBQzdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQTtJQUNsRSxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi9TdGFydHVwL3N0YXJ0dXAnXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0cygpIHtcbiAgICBjb25zdCBzb3VyY2VzID0gU3RhcnR1cERhdGFTdG9yZS5Db25maWd1cmF0aW9uLmdldERlZmF1bHRTb3VyY2VzKClcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgc291cmNlcyxcbiAgICAgIHNvcnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBhdHRyaWJ1dGU6ICdtb2RpZmllZCcsXG4gICAgICAgICAgZGlyZWN0aW9uOiAnZGVzY2VuZGluZycsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgdGVtcGxhdGU6IHVuZGVmaW5lZCxcbiAgICAgIHNwZWxsY2hlY2s6IGZhbHNlLFxuICAgICAgcGhvbmV0aWNzOiBmYWxzZSxcbiAgICAgIGFkZGl0aW9uYWxPcHRpb25zOiAne30nLFxuICAgIH1cbiAgfSxcbiAgaXNUZW1wbGF0ZSh0ZW1wbGF0ZTogYW55KSB7XG4gICAgaWYgKHRoaXMuZ2V0KCdkZWZhdWx0UmVzdWx0Rm9ybUlkJykgPT09IHRlbXBsYXRlLmlkKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICBpZiAodGhpcy5nZXQoJ3RlbXBsYXRlJykgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0KCd0ZW1wbGF0ZScpLmlkID09PSB0ZW1wbGF0ZS5pZFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH0sXG4gIGlzRGVmYXVsdFRlbXBsYXRlKHRlbXBsYXRlOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5pc1RlbXBsYXRlKHRlbXBsYXRlKSAmJiB0aGlzLmdldCgndGVtcGxhdGUnKS5kZWZhdWx0XG4gIH0sXG59KVxuIl19