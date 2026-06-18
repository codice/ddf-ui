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
import wrapNum from '../../../react-component/utils/wrap-num/wrap-num';
import Backbone from 'backbone';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo';
import * as usngs from 'usng.js';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usngs.Converter();
var usngPrecision = 6;
export default Backbone.AssociatedModel.extend({
    defaults: {
        mouseLat: undefined,
        mouseLon: undefined,
        coordinateValues: {
            dms: '',
            lat: '',
            lon: '',
            mgrs: '',
            utmUps: '',
        },
        target: undefined,
        targetMetacard: undefined,
    },
    clearMouseCoordinates: function () {
        this.set({
            mouseLat: undefined,
            mouseLon: undefined,
        });
    },
    updateMouseCoordinates: function (coordinates) {
        this.set({
            mouseLat: Number(coordinates.lat.toFixed(6)), // wrap in Number to chop off trailing zero
            mouseLon: Number(wrapNum(coordinates.lon, -180, 180).toFixed(6)),
        });
    },
    updateClickCoordinates: function () {
        var lat = this.get('mouseLat');
        var lon = this.get('mouseLon');
        var dms = "".concat(mtgeo.toLat(lat), " ").concat(mtgeo.toLon(lon));
        var mgrs = converter.isInUPSSpace(lat)
            ? undefined
            : converter.LLtoUSNG(lat, lon, usngPrecision);
        var utmUps = converter.LLtoUTMUPS(lat, lon);
        this.set({
            coordinateValues: {
                lat: lat,
                lon: lon,
                dms: dms,
                mgrs: mgrs,
                utmUps: utmUps,
            },
        });
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC92aXN1YWxpemF0aW9uL21hcHMvbWFwLm1vZGVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLE9BQU8sTUFBTSxrREFBa0QsQ0FBQTtBQUd0RSxPQUFPLFFBQVEsTUFBTSxVQUFVLENBQUE7QUFDL0IsbUpBQW1KO0FBQ25KLE9BQU8sS0FBSyxNQUFNLFFBQVEsQ0FBQTtBQUMxQixPQUFPLEtBQUssS0FBSyxNQUFNLFNBQVMsQ0FBQTtBQUNoQyw0RUFBNEU7QUFDNUUsSUFBTSxTQUFTLEdBQUcsSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUE7QUFDdkMsSUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFBO0FBRXZCLGVBQWUsUUFBUSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUM7SUFDN0MsUUFBUSxFQUFFO1FBQ1IsUUFBUSxFQUFFLFNBQVM7UUFDbkIsUUFBUSxFQUFFLFNBQVM7UUFDbkIsZ0JBQWdCLEVBQUU7WUFDaEIsR0FBRyxFQUFFLEVBQUU7WUFDUCxHQUFHLEVBQUUsRUFBRTtZQUNQLEdBQUcsRUFBRSxFQUFFO1lBQ1AsSUFBSSxFQUFFLEVBQUU7WUFDUixNQUFNLEVBQUUsRUFBRTtTQUNYO1FBQ0QsTUFBTSxFQUFFLFNBQVM7UUFDakIsY0FBYyxFQUFFLFNBQVM7S0FDMUI7SUFDRCxxQkFBcUI7UUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNQLFFBQVEsRUFBRSxTQUFTO1lBQ25CLFFBQVEsRUFBRSxTQUFTO1NBQ3BCLENBQUMsQ0FBQTtJQUNKLENBQUM7SUFDRCxzQkFBc0IsWUFBQyxXQUFnQjtRQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsUUFBUSxFQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLDJDQUEyQztZQUN6RixRQUFRLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqRSxDQUFDLENBQUE7SUFDSixDQUFDO0lBQ0Qsc0JBQXNCO1FBQ3BCLElBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUE7UUFDaEMsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQTtRQUNoQyxJQUFNLEdBQUcsR0FBRyxVQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFBO1FBQ3JELElBQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxTQUFTO1lBQ1gsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQTtRQUMvQyxJQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtRQUM3QyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ1AsZ0JBQWdCLEVBQUU7Z0JBQ2hCLEdBQUcsS0FBQTtnQkFDSCxHQUFHLEtBQUE7Z0JBQ0gsR0FBRyxLQUFBO2dCQUNILElBQUksTUFBQTtnQkFDSixNQUFNLFFBQUE7YUFDUDtTQUNGLENBQUMsQ0FBQTtJQUNKLENBQUM7Q0FDRixDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvcHlyaWdodCAoYykgQ29kaWNlIEZvdW5kYXRpb25cbiAqXG4gKiBUaGlzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnkgaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgTGVzc2VyXG4gKiBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZVxuICogTGljZW5zZSwgb3IgYW55IGxhdGVyIHZlcnNpb24uXG4gKlxuICogVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dFxuICogZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuIFNlZSB0aGUgR05VXG4gKiBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLiBBIGNvcHkgb2YgdGhlIEdOVSBMZXNzZXIgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogaXMgZGlzdHJpYnV0ZWQgYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0gYW5kIGNhbiBiZSBmb3VuZCBhdFxuICogPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy9sZ3BsLmh0bWw+LlxuICpcbiAqKi9cblxuaW1wb3J0IHdyYXBOdW0gZnJvbSAnLi4vLi4vLi4vcmVhY3QtY29tcG9uZW50L3V0aWxzL3dyYXAtbnVtL3dyYXAtbnVtJ1xuXG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgQmFja2JvbmUgZnJvbSAnYmFja2JvbmUnXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdtdC1nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBtdGdlbyBmcm9tICdtdC1nZW8nXG5pbXBvcnQgKiBhcyB1c25ncyBmcm9tICd1c25nLmpzJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAxIGFyZ3VtZW50cywgYnV0IGdvdCAwLlxuY29uc3QgY29udmVydGVyID0gbmV3IHVzbmdzLkNvbnZlcnRlcigpXG5jb25zdCB1c25nUHJlY2lzaW9uID0gNlxuXG5leHBvcnQgZGVmYXVsdCBCYWNrYm9uZS5Bc3NvY2lhdGVkTW9kZWwuZXh0ZW5kKHtcbiAgZGVmYXVsdHM6IHtcbiAgICBtb3VzZUxhdDogdW5kZWZpbmVkLFxuICAgIG1vdXNlTG9uOiB1bmRlZmluZWQsXG4gICAgY29vcmRpbmF0ZVZhbHVlczoge1xuICAgICAgZG1zOiAnJyxcbiAgICAgIGxhdDogJycsXG4gICAgICBsb246ICcnLFxuICAgICAgbWdyczogJycsXG4gICAgICB1dG1VcHM6ICcnLFxuICAgIH0sXG4gICAgdGFyZ2V0OiB1bmRlZmluZWQsXG4gICAgdGFyZ2V0TWV0YWNhcmQ6IHVuZGVmaW5lZCxcbiAgfSxcbiAgY2xlYXJNb3VzZUNvb3JkaW5hdGVzKCkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIG1vdXNlTGF0OiB1bmRlZmluZWQsXG4gICAgICBtb3VzZUxvbjogdW5kZWZpbmVkLFxuICAgIH0pXG4gIH0sXG4gIHVwZGF0ZU1vdXNlQ29vcmRpbmF0ZXMoY29vcmRpbmF0ZXM6IGFueSkge1xuICAgIHRoaXMuc2V0KHtcbiAgICAgIG1vdXNlTGF0OiBOdW1iZXIoY29vcmRpbmF0ZXMubGF0LnRvRml4ZWQoNikpLCAvLyB3cmFwIGluIE51bWJlciB0byBjaG9wIG9mZiB0cmFpbGluZyB6ZXJvXG4gICAgICBtb3VzZUxvbjogTnVtYmVyKHdyYXBOdW0oY29vcmRpbmF0ZXMubG9uLCAtMTgwLCAxODApLnRvRml4ZWQoNikpLFxuICAgIH0pXG4gIH0sXG4gIHVwZGF0ZUNsaWNrQ29vcmRpbmF0ZXMoKSB7XG4gICAgY29uc3QgbGF0ID0gdGhpcy5nZXQoJ21vdXNlTGF0JylcbiAgICBjb25zdCBsb24gPSB0aGlzLmdldCgnbW91c2VMb24nKVxuICAgIGNvbnN0IGRtcyA9IGAke210Z2VvLnRvTGF0KGxhdCl9ICR7bXRnZW8udG9Mb24obG9uKX1gXG4gICAgY29uc3QgbWdycyA9IGNvbnZlcnRlci5pc0luVVBTU3BhY2UobGF0KVxuICAgICAgPyB1bmRlZmluZWRcbiAgICAgIDogY29udmVydGVyLkxMdG9VU05HKGxhdCwgbG9uLCB1c25nUHJlY2lzaW9uKVxuICAgIGNvbnN0IHV0bVVwcyA9IGNvbnZlcnRlci5MTHRvVVRNVVBTKGxhdCwgbG9uKVxuICAgIHRoaXMuc2V0KHtcbiAgICAgIGNvb3JkaW5hdGVWYWx1ZXM6IHtcbiAgICAgICAgbGF0LFxuICAgICAgICBsb24sXG4gICAgICAgIGRtcyxcbiAgICAgICAgbWdycyxcbiAgICAgICAgdXRtVXBzLFxuICAgICAgfSxcbiAgICB9KVxuICB9LFxufSlcbiJdfQ==