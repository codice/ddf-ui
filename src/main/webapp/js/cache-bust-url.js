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
export function cacheBustUrl(url) {
    if (url && url.indexOf('_=') === -1) {
        var newUrl = url;
        if (url.indexOf('?') >= 0) {
            newUrl += '&';
        }
        else {
            newUrl += '?';
        }
        newUrl += '_=' + Date.now();
        return newUrl;
    }
    return url;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FjaGUtYnVzdC11cmwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbWFpbi93ZWJhcHAvanMvY2FjaGUtYnVzdC11cmwudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixNQUFNLFVBQVUsWUFBWSxDQUFDLEdBQVc7SUFDdEMsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNuQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUE7UUFDaEIsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN6QixNQUFNLElBQUksR0FBRyxDQUFBO1NBQ2Q7YUFBTTtZQUNMLE1BQU0sSUFBSSxHQUFHLENBQUE7U0FDZDtRQUNELE1BQU0sSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQzNCLE9BQU8sTUFBTSxDQUFBO0tBQ2Q7SUFDRCxPQUFPLEdBQUcsQ0FBQTtBQUNaLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWNoZUJ1c3RVcmwodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAodXJsICYmIHVybC5pbmRleE9mKCdfPScpID09PSAtMSkge1xuICAgIGxldCBuZXdVcmwgPSB1cmxcbiAgICBpZiAodXJsLmluZGV4T2YoJz8nKSA+PSAwKSB7XG4gICAgICBuZXdVcmwgKz0gJyYnXG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1VybCArPSAnPydcbiAgICB9XG4gICAgbmV3VXJsICs9ICdfPScgKyBEYXRlLm5vdygpXG4gICAgcmV0dXJuIG5ld1VybFxuICB9XG4gIHJldHVybiB1cmxcbn1cbiJdfQ==