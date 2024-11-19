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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0YWNhcmRBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvbW9kZWwvTWV0YWNhcmRBY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sUUFBUSxNQUFNLFVBQVUsQ0FBQTtBQUUvQixPQUFPLHVCQUF1QixDQUFBO0FBQzlCLG1KQUFtSjtBQUNuSixPQUFPLFdBQVcsTUFBTSx1QkFBdUIsQ0FBQTtBQUMvQyxJQUFNLHlCQUF5QixHQUFHLFlBQVksQ0FBQTtBQUM5QyxJQUFNLHlCQUF5QixHQUFHLGtCQUFrQixDQUFDLHlCQUF5QixDQUFDLENBQUE7QUFFL0UsZUFBZSxRQUFRLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztJQUM3QyxRQUFRO1FBQ04sT0FBTztZQUNMLEdBQUcsRUFBRSxTQUFTO1lBQ2QsS0FBSyxFQUFFLFNBQVM7WUFDaEIsV0FBVyxFQUFFLFNBQVM7WUFDdEIsRUFBRSxFQUFFLFNBQVM7WUFDYixPQUFPLEVBQUUsU0FBUztZQUNsQixXQUFXLEVBQUUsU0FBUztTQUN2QixDQUFBO0lBQ0gsQ0FBQztJQUNELGFBQWE7UUFDWCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUE7SUFDaEMsQ0FBQztJQUNELFVBQVU7UUFDUixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDcEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQzNELENBQUM7SUFDRCxhQUFhO1FBQ1gsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUNyQyxxQkFBcUI7WUFDckIsNkZBQTZGO1lBQzdGLHdEQUF3RDtZQUN4RCw0SEFBNEg7WUFDNUgsNEVBQTRFO1lBQzVFLHNHQUFzRztZQUN0Ryw4RkFBOEY7WUFDOUYsc0VBQXNFO1lBQ3RFLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDM0IsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FDN0IseUJBQXlCLEVBQ3pCLHlCQUF5QixDQUMxQixDQUFBO1lBQ0QsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtZQUN4RCxJQUFNLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLENBQUM7Z0JBQzdDLE9BQU8sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzthQUM3QixDQUFDLENBQUE7WUFFRixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQTtTQUM3QjtJQUNILENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCBCYWNrYm9uZSBmcm9tICdiYWNrYm9uZSdcblxuaW1wb3J0ICdiYWNrYm9uZS1hc3NvY2lhdGlvbnMnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICd1cmlqLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBVUklUZW1wbGF0ZSBmcm9tICd1cmlqcy9zcmMvVVJJVGVtcGxhdGUnXG5jb25zdCBERUNPREVEX1FVRVJZX0lEX1RFTVBMQVRFID0gJ3smcXVlcnlJZH0nXG5jb25zdCBFTkNPREVEX1FVRVJZX0lEX1RFTVBMQVRFID0gZW5jb2RlVVJJQ29tcG9uZW50KERFQ09ERURfUVVFUllfSURfVEVNUExBVEUpXG5cbmV4cG9ydCBkZWZhdWx0IEJhY2tib25lLkFzc29jaWF0ZWRNb2RlbC5leHRlbmQoe1xuICBkZWZhdWx0cygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXJsOiB1bmRlZmluZWQsXG4gICAgICB0aXRsZTogdW5kZWZpbmVkLFxuICAgICAgZGVzY3JpcHRpb246IHVuZGVmaW5lZCxcbiAgICAgIGlkOiB1bmRlZmluZWQsXG4gICAgICBxdWVyeUlkOiB1bmRlZmluZWQsXG4gICAgICBkaXNwbGF5TmFtZTogdW5kZWZpbmVkLFxuICAgIH1cbiAgfSxcbiAgZ2V0RXhwb3J0VHlwZSgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoJ2Rpc3BsYXlOYW1lJylcbiAgfSxcbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICB0aGlzLmhhbmRsZVF1ZXJ5SWQoKVxuICAgIHRoaXMubGlzdGVuVG8odGhpcywgJ2NoYW5nZTpxdWVyeUlkJywgdGhpcy5oYW5kbGVRdWVyeUlkKVxuICB9LFxuICBoYW5kbGVRdWVyeUlkKCkge1xuICAgIGlmICh0aGlzLmdldCgncXVlcnlJZCcpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIC8vIFRoaXMgaXMgdGhlIHN0b3J5OlxuICAgICAgLy8gQW4gYWN0aW9uIHByb3ZpZGVyIGNhbiBpbmNsdWRlIHsmcXVlcnlJZH0gYXMgYSB0ZW1wbGF0ZSBpbiB0aGUgdXJsIGlmIGl0IG5lZWRzIHRoZSBxdWVyeUlkXG4gICAgICAvLyBUaGUgYmFja2VuZCBpcyBlbmNvZGluZyB7JnF1ZXJ5SWR9IGJlY2F1c2UgaXQgaGFzIHRvLlxuICAgICAgLy8gVGhlIGVudGlyZSB1cmwgd2FzIGJlaW5nIGRlY29kZWQgYW5kIHRoYXQgY2F1c2VkIGlzc3VlcyBiZWNhdXNlIGl0IGRlY29kZWQgdGhpbmdzIHRoYXQgd2VyZSBzdXBwb3NlZCB0byBiZSByZW1haW4gZW5jb2RlZFxuICAgICAgLy8gVGhlIGVudGlyZSB1cmwgY291bGRuJ3QgYmUgZW5jb2RlZCBiZWNhdXNlIGl0IHdhcyByZXR1cm5pbmcgYSB1c2VsZXNzIHVybFxuICAgICAgLy8gQW4gYXR0ZW1wdCB3YXMgbWFkZSBhdCBkZWNvZGluZyBhbmQgZW5jb2RpbmcgdGhlIGluZGl2aWR1YWwgcGFydHMgb2YgYm90aCB0aGUgcGF0aCBhbmQgcXVlcnkgcGFyYW1zXG4gICAgICAvLyBUaGlzIGNhdXNlZCBhbiBpc3N1ZSBiZWNhdXNlIGl0IHdhcyBlbmNvZGluZyB0aGUgdHJhbnNmb3JtIGlkcywgc29tZSBvZiB3aGljaCBpbmNsdWRlIGEgJzonXG4gICAgICAvLyBTbyB0aGF0J3Mgd2h5IHRoZSBzdHJpbmcgcmVwbGFjZSBcImRlY29kaW5nXCIgaXMgY3VycmVudGx5IGJlaW5nIGRvbmVcbiAgICAgIGNvbnN0IHVybCA9IHRoaXMuZ2V0KCd1cmwnKVxuICAgICAgY29uc3QgcmVwbGFjZWRVcmwgPSB1cmwucmVwbGFjZShcbiAgICAgICAgRU5DT0RFRF9RVUVSWV9JRF9URU1QTEFURSxcbiAgICAgICAgREVDT0RFRF9RVUVSWV9JRF9URU1QTEFURVxuICAgICAgKVxuICAgICAgY29uc3QgcmVwbGFjZWRVcmxUZW1wbGF0ZSA9IG5ldyBVUklUZW1wbGF0ZShyZXBsYWNlZFVybClcbiAgICAgIGNvbnN0IGV4cGFuZGVkVXJsID0gcmVwbGFjZWRVcmxUZW1wbGF0ZS5leHBhbmQoe1xuICAgICAgICBxdWVyeUlkOiB0aGlzLmdldCgncXVlcnlJZCcpLFxuICAgICAgfSlcblxuICAgICAgdGhpcy5zZXQoJ3VybCcsIGV4cGFuZGVkVXJsKVxuICAgIH1cbiAgfSxcbn0pXG4iXX0=