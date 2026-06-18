import { __awaiter, __generator } from "tslib";
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
import $ from 'jquery';
import { Overridable } from '../../../js/model/Base/base-classes';
export default function saveFile(name, type, data) {
    return __awaiter(this, void 0, void 0, function () {
        var a, url;
        return __generator(this, function (_a) {
            if (data != null && navigator.msSaveBlob)
                return [2 /*return*/, navigator.msSaveBlob(new Blob([data], { type: type }), name)];
            a = $("<a style='display: none;'/>");
            url = window.URL.createObjectURL(new Blob([data], { type: type }));
            a.attr('href', url);
            a.attr('download', name);
            $('body').append(a);
            a[0].click();
            window.URL.revokeObjectURL(url);
            a.remove();
            return [2 /*return*/];
        });
    });
}
// return filename portion of content-disposition
export function getFilenameFromContentDisposition(contentDisposition) {
    if (contentDisposition == null) {
        return null;
    }
    var parts = contentDisposition.split('=', 2);
    if (parts.length !== 2) {
        return null;
    }
    return parts[1];
}
export var OverridableSaveFile = new Overridable(saveFile);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2F2ZS1maWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL3JlYWN0LWNvbXBvbmVudC91dGlscy9zYXZlLWZpbGUvc2F2ZS1maWxlLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQTtBQUN0QixPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUNBQXFDLENBQUE7QUFFakUsTUFBTSxDQUFDLE9BQU8sVUFBZ0IsUUFBUSxDQUFDLElBQVksRUFBRSxJQUFZLEVBQUUsSUFBUzs7OztZQUMxRSxJQUFJLElBQUksSUFBSSxJQUFJLElBQUssU0FBaUIsQ0FBQyxVQUFVO2dCQUMvQyxzQkFBUSxTQUFpQixDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUE7WUFDMUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFBO1lBQ3BDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQTtZQUN0RSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUNuQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUN4QixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ25CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtZQUNaLE1BQU0sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQy9CLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTs7OztDQUNYO0FBRUQsaURBQWlEO0FBQ2pELE1BQU0sVUFBVSxpQ0FBaUMsQ0FBQyxrQkFBMEI7SUFDMUUsSUFBSSxrQkFBa0IsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUMvQixPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFRCxJQUFJLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQzVDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUN2QixPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFDRCxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNqQixDQUFDO0FBRUQsTUFBTSxDQUFDLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSdcbmltcG9ydCB7IE92ZXJyaWRhYmxlIH0gZnJvbSAnLi4vLi4vLi4vanMvbW9kZWwvQmFzZS9iYXNlLWNsYXNzZXMnXG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIHNhdmVGaWxlKG5hbWU6IHN0cmluZywgdHlwZTogc3RyaW5nLCBkYXRhOiBhbnkpIHtcbiAgaWYgKGRhdGEgIT0gbnVsbCAmJiAobmF2aWdhdG9yIGFzIGFueSkubXNTYXZlQmxvYilcbiAgICByZXR1cm4gKG5hdmlnYXRvciBhcyBhbnkpLm1zU2F2ZUJsb2IobmV3IEJsb2IoW2RhdGFdLCB7IHR5cGU6IHR5cGUgfSksIG5hbWUpXG4gIGxldCBhID0gJChcIjxhIHN0eWxlPSdkaXNwbGF5OiBub25lOycvPlwiKVxuICBsZXQgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW2RhdGFdLCB7IHR5cGU6IHR5cGUgfSkpXG4gIGEuYXR0cignaHJlZicsIHVybClcbiAgYS5hdHRyKCdkb3dubG9hZCcsIG5hbWUpXG4gICQoJ2JvZHknKS5hcHBlbmQoYSlcbiAgYVswXS5jbGljaygpXG4gIHdpbmRvdy5VUkwucmV2b2tlT2JqZWN0VVJMKHVybClcbiAgYS5yZW1vdmUoKVxufVxuXG4vLyByZXR1cm4gZmlsZW5hbWUgcG9ydGlvbiBvZiBjb250ZW50LWRpc3Bvc2l0aW9uXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZW5hbWVGcm9tQ29udGVudERpc3Bvc2l0aW9uKGNvbnRlbnREaXNwb3NpdGlvbjogc3RyaW5nKSB7XG4gIGlmIChjb250ZW50RGlzcG9zaXRpb24gPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBsZXQgcGFydHMgPSBjb250ZW50RGlzcG9zaXRpb24uc3BsaXQoJz0nLCAyKVxuICBpZiAocGFydHMubGVuZ3RoICE9PSAyKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICByZXR1cm4gcGFydHNbMV1cbn1cblxuZXhwb3J0IGNvbnN0IE92ZXJyaWRhYmxlU2F2ZUZpbGUgPSBuZXcgT3ZlcnJpZGFibGUoc2F2ZUZpbGUpXG4iXX0=