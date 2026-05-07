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
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'urij... Remove this comment to see the full error message
import URITemplate from 'urijs/src/URITemplate';
var DECODED_QUERY_ID_TEMPLATE = '{&queryId}';
var ENCODED_QUERY_ID_TEMPLATE = encodeURIComponent(DECODED_QUERY_ID_TEMPLATE);
export default Backbone.AssociatedModel.extend({
    defaults: function () {
        return {
            url: undefined,
            title: undefined,
            description: undefined,
            id: undefined,
            queryId: undefined,
            displayName: undefined,
        };
    },
    getExportType: function () {
        return this.get('displayName');
    },
    initialize: function () {
        this.handleQueryId();
        this.listenTo(this, 'change:queryId', this.handleQueryId);
    },
    handleQueryId: function () {
        if (this.get('queryId') !== undefined) {
            // This is the story:
            // An action provider can include {&queryId} as a template in the url if it needs the queryId
            // The backend is encoding {&queryId} because it has to.
            // The entire url was being decoded and that caused issues because it decoded things that were supposed to be remain encoded
            // The entire url couldn't be encoded because it was returning a useless url
            // An attempt was made at decoding and encoding the individual parts of both the path and query params
            // This caused an issue because it was encoding the transform ids, some of which include a ':'
            // So that's why the string replace "decoding" is currently being done
            var url = this.get('url');
            var replacedUrl = url.replace(ENCODED_QUERY_ID_TEMPLATE, DECODED_QUERY_ID_TEMPLATE);
            var replacedUrlTemplate = new URITemplate(replacedUrl);
            var expandedUrl = replacedUrlTemplate.expand({
                queryId: this.get('queryId'),
            });
            this.set('url', expandedUrl);
        }
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YWNhcmRBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvTWV0YWNhcmRBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUUvQixPQUFPLHVCQUF1QixDQUFBO0FBQzlCLG1KQUFtSjtBQUNuSixPQUFPLFdBQVcsTUFBTSx1QkFBdUIsQ0FBQTtBQUMvQyxJQUFNLHlCQUF5QixHQUFHLFlBQVksQ0FBQTtBQUM5QyxJQUFNLHlCQUF5QixHQUFHLGtCQUFrQixDQUFDLHlCQUF5QixDQUFDLENBQUE7QUFFL0UsZUFBZSxRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUM3QyxRQUFRO1FBQ04sT0FBTztZQUNMLEdBQUcsRUFBRSxTQUFTO1lBQ2QsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLFNBQVM7WUFDdEIsRUFBRSxFQUFFLFNBQVM7WUFDYixPQUFPLEVBQUUsU0FBUztZQUNsQixXQUFXLEVBQUUsU0FBUztTQUN2QixDQUFBO0lBQ0gsQ0FBQztJQUNELGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDaEMsQ0FBQztJQUNELFVBQVU7UUFDUixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzNELENBQUM7SUFDRCxhQUFhO1FBQ1gsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3RDLHFCQUFxQjtZQUNyQiw2RkFBNkY7WUFDN0Ysd0RBQXdEO1lBQ3hELDRIQUE0SDtZQUM1SCw0RUFBNEU7WUFDNUUsc0dBQXNHO1lBQ3RHLDhGQUE4RjtZQUM5RixzRUFBc0U7WUFDdEUsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUMzQixJQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUM3Qix5QkFBeUIsRUFDekIseUJBQXlCLENBQzFCLENBQUE7WUFDRCxJQUFNLG1CQUFtQixHQUFHLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQ3hELElBQU0sV0FBVyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sQ0FBQztnQkFDN0MsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO2FBQzdCLENBQUMsQ0FBQTtZQUVGLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBQzlCLENBQUM7SUFDSCxDQUFDO0NBQ0YsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG5cbmltcG9ydCAnYmFja2JvbmUtYXNzb2NpYXRpb25zJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAndXJpai4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgVVJJVGVtcGxhdGUgZnJvbSAndXJpanMvc3JjL1VSSVRlbXBsYXRlJ1xuY29uc3QgREVDT0RFRF9RVUVSWV9JRF9URU1QTEFURSA9ICd7JnF1ZXJ5SWR9J1xuY29uc3QgRU5DT0RFRF9RVUVSWV9JRF9URU1QTEFURSA9IGVuY29kZVVSSUNvbXBvbmVudChERUNPREVEX1FVRVJZX0lEX1RFTVBMQVRFKVxuXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgZGVmYXVsdHMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVybDogdW5kZWZpbmVkLFxuICAgICAgdGl0bGU6IHVuZGVmaW5lZCxcbiAgICAgIGRlc2NyaXB0aW9uOiB1bmRlZmluZWQsXG4gICAgICBpZDogdW5kZWZpbmVkLFxuICAgICAgcXVlcnlJZDogdW5kZWZpbmVkLFxuICAgICAgZGlzcGxheU5hbWU6IHVuZGVmaW5lZCxcbiAgICB9XG4gIH0sXG4gIGdldEV4cG9ydFR5cGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdkaXNwbGF5TmFtZScpXG4gIH0sXG4gIGluaXRpYWxpemUoKSB7XG4gICAgdGhpcy5oYW5kbGVRdWVyeUlkKClcbiAgICB0aGlzLmxpc3RlblRvKHRoaXMsICdjaGFuZ2U6cXVlcnlJZCcsIHRoaXMuaGFuZGxlUXVlcnlJZClcbiAgfSxcbiAgaGFuZGxlUXVlcnlJZCgpIHtcbiAgICBpZiAodGhpcy5nZXQoJ3F1ZXJ5SWQnKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAvLyBUaGlzIGlzIHRoZSBzdG9yeTpcbiAgICAgIC8vIEFuIGFjdGlvbiBwcm92aWRlciBjYW4gaW5jbHVkZSB7JnF1ZXJ5SWR9IGFzIGEgdGVtcGxhdGUgaW4gdGhlIHVybCBpZiBpdCBuZWVkcyB0aGUgcXVlcnlJZFxuICAgICAgLy8gVGhlIGJhY2tlbmQgaXMgZW5jb2RpbmcgeyZxdWVyeUlkfSBiZWNhdXNlIGl0IGhhcyB0by5cbiAgICAgIC8vIFRoZSBlbnRpcmUgdXJsIHdhcyBiZWluZyBkZWNvZGVkIGFuZCB0aGF0IGNhdXNlZCBpc3N1ZXMgYmVjYXVzZSBpdCBkZWNvZGVkIHRoaW5ncyB0aGF0IHdlcmUgc3VwcG9zZWQgdG8gYmUgcmVtYWluIGVuY29kZWRcbiAgICAgIC8vIFRoZSBlbnRpcmUgdXJsIGNvdWxkbid0IGJlIGVuY29kZWQgYmVjYXVzZSBpdCB3YXMgcmV0dXJuaW5nIGEgdXNlbGVzcyB1cmxcbiAgICAgIC8vIEFuIGF0dGVtcHQgd2FzIG1hZGUgYXQgZGVjb2RpbmcgYW5kIGVuY29kaW5nIHRoZSBpbmRpdmlkdWFsIHBhcnRzIG9mIGJvdGggdGhlIHBhdGggYW5kIHF1ZXJ5IHBhcmFtc1xuICAgICAgLy8gVGhpcyBjYXVzZWQgYW4gaXNzdWUgYmVjYXVzZSBpdCB3YXMgZW5jb2RpbmcgdGhlIHRyYW5zZm9ybSBpZHMsIHNvbWUgb2Ygd2hpY2ggaW5jbHVkZSBhICc6J1xuICAgICAgLy8gU28gdGhhdCdzIHdoeSB0aGUgc3RyaW5nIHJlcGxhY2UgXCJkZWNvZGluZ1wiIGlzIGN1cnJlbnRseSBiZWluZyBkb25lXG4gICAgICBjb25zdCB1cmwgPSB0aGlzLmdldCgndXJsJylcbiAgICAgIGNvbnN0IHJlcGxhY2VkVXJsID0gdXJsLnJlcGxhY2UoXG4gICAgICAgIEVOQ09ERURfUVVFUllfSURfVEVNUExBVEUsXG4gICAgICAgIERFQ09ERURfUVVFUllfSURfVEVNUExBVEVcbiAgICAgIClcbiAgICAgIGNvbnN0IHJlcGxhY2VkVXJsVGVtcGxhdGUgPSBuZXcgVVJJVGVtcGxhdGUocmVwbGFjZWRVcmwpXG4gICAgICBjb25zdCBleHBhbmRlZFVybCA9IHJlcGxhY2VkVXJsVGVtcGxhdGUuZXhwYW5kKHtcbiAgICAgICAgcXVlcnlJZDogdGhpcy5nZXQoJ3F1ZXJ5SWQnKSxcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuc2V0KCd1cmwnLCBleHBhbmRlZFVybClcbiAgICB9XG4gIH0sXG59KVxuIl19