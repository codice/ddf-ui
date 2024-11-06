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
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo';
import * as usngs from 'usng.js';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usngs.Converter();
var usngPrecision = 6;
import { validCoordinates } from '.';
import Common from '../../js/Common';
import { StartupDataStore } from '../../js/model/Startup/startup';
export var formatAttribute = function (_a) {
    var name = _a.name, value = _a.value;
    var definition = StartupDataStore.MetacardDefinitions.getAttributeMap()[name];
    if (definition === undefined) {
        return null;
    }
    var isDate = definition.type === 'DATE';
    var displayName = definition.alias || name;
    return "".concat(displayName.toUpperCase(), ": ").concat(isDate ? Common.getHumanReadableDateTime(value) : value);
};
var formatter = {
    degrees: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return "".concat(mtgeo.toLat(lat), " ").concat(mtgeo.toLon(lon));
    },
    decimal: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return decimalComponent({ lat: lat, lon: lon });
    },
    mgrs: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return lat > 84 || lat < -80
            ? 'In UPS Space'
            : converter.LLtoUSNG(lat, lon, usngPrecision);
    },
    utm: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return converter.LLtoUTMUPS(lat, lon);
    },
    wkt: function (_a) {
        var lat = _a.lat, lon = _a.lon;
        return "POINT (".concat(lon, " ").concat(lat, ")");
    },
};
export var formatCoordinates = function (_a) {
    var coordinates = _a.coordinates, format = _a.format;
    if (!(format in formatter)) {
        throw "Unrecognized coordinate format value [".concat(format, "]");
    }
    return validCoordinates(coordinates)
        ? formatter[format](coordinates)
        : undefined;
};
var decimalComponent = function (_a) {
    var lat = _a.lat, lon = _a.lon;
    var numPlaces = 6;
    var latPadding = numPlaces + 4;
    var lonPadding = numPlaces + 5;
    var formattedLat = lat
        .toFixed(numPlaces)
        .toString()
        .padStart(latPadding, ' ');
    var formattedLon = lon
        .toFixed(numPlaces)
        .toString()
        .padStart(lonPadding, ' ');
    return "".concat(formattedLat, " ").concat(formattedLon);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbWFwLWluZm8vZm9ybWF0dGluZy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLG1KQUFtSjtBQUNuSixPQUFPLEtBQUssTUFBTSxRQUFRLENBQUE7QUFDMUIsT0FBTyxLQUFLLEtBQUssTUFBTSxTQUFTLENBQUE7QUFFaEMsNEVBQTRFO0FBQzVFLElBQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ3ZDLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQTtBQUV2QixPQUFPLEVBQWtDLGdCQUFnQixFQUFFLE1BQU0sR0FBRyxDQUFBO0FBQ3BFLE9BQU8sTUFBTSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBRWpFLE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBQTBCO1FBQXhCLElBQUksVUFBQSxFQUFFLEtBQUssV0FBQTtJQUMzQyxJQUFNLFVBQVUsR0FDZCxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5RCxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUU7UUFDNUIsT0FBTyxJQUFJLENBQUE7S0FDWjtJQUVELElBQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFBO0lBQ3pDLElBQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFBO0lBRTVDLE9BQU8sVUFBRyxXQUFXLENBQUMsV0FBVyxFQUFFLGVBQ2pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQ3ZELENBQUE7QUFDSixDQUFDLENBQUE7QUFFRCxJQUFNLFNBQVMsR0FBRztJQUNoQixPQUFPLEVBQUUsVUFBQyxFQUF5QjtZQUF2QixHQUFHLFNBQUEsRUFBRSxHQUFHLFNBQUE7UUFDbEIsT0FBQSxVQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBRTtJQUF6QyxDQUF5QztJQUMzQyxPQUFPLEVBQUUsVUFBQyxFQUF5QjtZQUF2QixHQUFHLFNBQUEsRUFBRSxHQUFHLFNBQUE7UUFBb0IsT0FBQSxnQkFBZ0IsQ0FBQyxFQUFFLEdBQUcsS0FBQSxFQUFFLEdBQUcsS0FBQSxFQUFFLENBQUM7SUFBOUIsQ0FBOEI7SUFDdEUsSUFBSSxFQUFFLFVBQUMsRUFBeUI7WUFBdkIsR0FBRyxTQUFBLEVBQUUsR0FBRyxTQUFBO1FBQ2YsT0FBQSxHQUFHLEdBQUcsRUFBRSxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7WUFDbkIsQ0FBQyxDQUFDLGNBQWM7WUFDaEIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxhQUFhLENBQUM7SUFGL0MsQ0FFK0M7SUFDakQsR0FBRyxFQUFFLFVBQUMsRUFBeUI7WUFBdkIsR0FBRyxTQUFBLEVBQUUsR0FBRyxTQUFBO1FBQW9CLE9BQUEsU0FBUyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0lBQTlCLENBQThCO0lBQ2xFLEdBQUcsRUFBRSxVQUFDLEVBQXlCO1lBQXZCLEdBQUcsU0FBQSxFQUFFLEdBQUcsU0FBQTtRQUFvQixPQUFBLGlCQUFVLEdBQUcsY0FBSSxHQUFHLE1BQUc7SUFBdkIsQ0FBdUI7Q0FDNUQsQ0FBQTtBQUVELE1BQU0sQ0FBQyxJQUFNLGlCQUFpQixHQUFHLFVBQUMsRUFNakM7UUFMQyxXQUFXLGlCQUFBLEVBQ1gsTUFBTSxZQUFBO0lBS04sSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxFQUFFO1FBQzFCLE1BQU0sZ0RBQXlDLE1BQU0sTUFBRyxDQUFBO0tBQ3pEO0lBRUQsT0FBTyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7UUFDbEMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUM7UUFDaEMsQ0FBQyxDQUFDLFNBQVMsQ0FBQTtBQUNmLENBQUMsQ0FBQTtBQUVELElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxFQUF5QjtRQUF2QixHQUFHLFNBQUEsRUFBRSxHQUFHLFNBQUE7SUFDbEMsSUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFBO0lBQ25CLElBQU0sVUFBVSxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUE7SUFDaEMsSUFBTSxVQUFVLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQTtJQUVoQyxJQUFNLFlBQVksR0FBRyxHQUFHO1NBQ3JCLE9BQU8sQ0FBQyxTQUFTLENBQUM7U0FDbEIsUUFBUSxFQUFFO1NBQ1YsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUU1QixJQUFNLFlBQVksR0FBRyxHQUFHO1NBQ3JCLE9BQU8sQ0FBQyxTQUFTLENBQUM7U0FDbEIsUUFBUSxFQUFFO1NBQ1YsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQTtJQUU1QixPQUFPLFVBQUcsWUFBWSxjQUFJLFlBQVksQ0FBRSxDQUFBO0FBQzFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMTYpIEZJWE1FOiBDb3VsZCBub3QgZmluZCBhIGRlY2xhcmF0aW9uIGZpbGUgZm9yIG1vZHVsZSAnbXQtZy4uLiBSZW1vdmUgdGhpcyBjb21tZW50IHRvIHNlZSB0aGUgZnVsbCBlcnJvciBtZXNzYWdlXG5pbXBvcnQgbXRnZW8gZnJvbSAnbXQtZ2VvJ1xuaW1wb3J0ICogYXMgdXNuZ3MgZnJvbSAndXNuZy5qcydcblxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAxIGFyZ3VtZW50cywgYnV0IGdvdCAwLlxuY29uc3QgY29udmVydGVyID0gbmV3IHVzbmdzLkNvbnZlcnRlcigpXG5jb25zdCB1c25nUHJlY2lzaW9uID0gNlxuXG5pbXBvcnQgeyBBdHRyaWJ1dGUsIENvb3JkaW5hdGVzLCBGb3JtYXQsIHZhbGlkQ29vcmRpbmF0ZXMgfSBmcm9tICcuJ1xuaW1wb3J0IENvbW1vbiBmcm9tICcuLi8uLi9qcy9Db21tb24nXG5pbXBvcnQgeyBTdGFydHVwRGF0YVN0b3JlIH0gZnJvbSAnLi4vLi4vanMvbW9kZWwvU3RhcnR1cC9zdGFydHVwJ1xuXG5leHBvcnQgY29uc3QgZm9ybWF0QXR0cmlidXRlID0gKHsgbmFtZSwgdmFsdWUgfTogQXR0cmlidXRlKTogc3RyaW5nIHwgbnVsbCA9PiB7XG4gIGNvbnN0IGRlZmluaXRpb24gPVxuICAgIFN0YXJ0dXBEYXRhU3RvcmUuTWV0YWNhcmREZWZpbml0aW9ucy5nZXRBdHRyaWJ1dGVNYXAoKVtuYW1lXVxuICBpZiAoZGVmaW5pdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGlzRGF0ZSA9IGRlZmluaXRpb24udHlwZSA9PT0gJ0RBVEUnXG4gIGNvbnN0IGRpc3BsYXlOYW1lID0gZGVmaW5pdGlvbi5hbGlhcyB8fCBuYW1lXG5cbiAgcmV0dXJuIGAke2Rpc3BsYXlOYW1lLnRvVXBwZXJDYXNlKCl9OiAke1xuICAgIGlzRGF0ZSA/IENvbW1vbi5nZXRIdW1hblJlYWRhYmxlRGF0ZVRpbWUodmFsdWUpIDogdmFsdWVcbiAgfWBcbn1cblxuY29uc3QgZm9ybWF0dGVyID0ge1xuICBkZWdyZWVzOiAoeyBsYXQsIGxvbiB9OiBDb29yZGluYXRlcykgPT5cbiAgICBgJHttdGdlby50b0xhdChsYXQpfSAke210Z2VvLnRvTG9uKGxvbil9YCxcbiAgZGVjaW1hbDogKHsgbGF0LCBsb24gfTogQ29vcmRpbmF0ZXMpID0+IGRlY2ltYWxDb21wb25lbnQoeyBsYXQsIGxvbiB9KSxcbiAgbWdyczogKHsgbGF0LCBsb24gfTogQ29vcmRpbmF0ZXMpID0+XG4gICAgbGF0ID4gODQgfHwgbGF0IDwgLTgwXG4gICAgICA/ICdJbiBVUFMgU3BhY2UnXG4gICAgICA6IGNvbnZlcnRlci5MTHRvVVNORyhsYXQsIGxvbiwgdXNuZ1ByZWNpc2lvbiksXG4gIHV0bTogKHsgbGF0LCBsb24gfTogQ29vcmRpbmF0ZXMpID0+IGNvbnZlcnRlci5MTHRvVVRNVVBTKGxhdCwgbG9uKSxcbiAgd2t0OiAoeyBsYXQsIGxvbiB9OiBDb29yZGluYXRlcykgPT4gYFBPSU5UICgke2xvbn0gJHtsYXR9KWAsXG59XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRDb29yZGluYXRlcyA9ICh7XG4gIGNvb3JkaW5hdGVzLFxuICBmb3JtYXQsXG59OiB7XG4gIGNvb3JkaW5hdGVzOiBDb29yZGluYXRlc1xuICBmb3JtYXQ6IEZvcm1hdFxufSkgPT4ge1xuICBpZiAoIShmb3JtYXQgaW4gZm9ybWF0dGVyKSkge1xuICAgIHRocm93IGBVbnJlY29nbml6ZWQgY29vcmRpbmF0ZSBmb3JtYXQgdmFsdWUgWyR7Zm9ybWF0fV1gXG4gIH1cblxuICByZXR1cm4gdmFsaWRDb29yZGluYXRlcyhjb29yZGluYXRlcylcbiAgICA/IGZvcm1hdHRlcltmb3JtYXRdKGNvb3JkaW5hdGVzKVxuICAgIDogdW5kZWZpbmVkXG59XG5cbmNvbnN0IGRlY2ltYWxDb21wb25lbnQgPSAoeyBsYXQsIGxvbiB9OiBDb29yZGluYXRlcykgPT4ge1xuICBjb25zdCBudW1QbGFjZXMgPSA2XG4gIGNvbnN0IGxhdFBhZGRpbmcgPSBudW1QbGFjZXMgKyA0XG4gIGNvbnN0IGxvblBhZGRpbmcgPSBudW1QbGFjZXMgKyA1XG5cbiAgY29uc3QgZm9ybWF0dGVkTGF0ID0gbGF0XG4gICAgLnRvRml4ZWQobnVtUGxhY2VzKVxuICAgIC50b1N0cmluZygpXG4gICAgLnBhZFN0YXJ0KGxhdFBhZGRpbmcsICcgJylcblxuICBjb25zdCBmb3JtYXR0ZWRMb24gPSBsb25cbiAgICAudG9GaXhlZChudW1QbGFjZXMpXG4gICAgLnRvU3RyaW5nKClcbiAgICAucGFkU3RhcnQobG9uUGFkZGluZywgJyAnKVxuXG4gIHJldHVybiBgJHtmb3JtYXR0ZWRMYXR9ICR7Zm9ybWF0dGVkTG9ufWBcbn1cbiJdfQ==