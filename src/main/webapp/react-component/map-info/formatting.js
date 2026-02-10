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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0dGluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9yZWFjdC1jb21wb25lbnQvbWFwLWluZm8vZm9ybWF0dGluZy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7SUFhSTtBQUNKLG1KQUFtSjtBQUNuSixPQUFPLEtBQUssTUFBTSxRQUFRLENBQUE7QUFDMUIsT0FBTyxLQUFLLEtBQUssTUFBTSxTQUFTLENBQUE7QUFFaEMsNEVBQTRFO0FBQzVFLElBQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFBO0FBQ3ZDLElBQU0sYUFBYSxHQUFHLENBQUMsQ0FBQTtBQUV2QixPQUFPLEVBQWtDLGdCQUFnQixFQUFFLE1BQU0sR0FBRyxDQUFBO0FBQ3BFLE9BQU8sTUFBTSxNQUFNLGlCQUFpQixDQUFBO0FBQ3BDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFBO0FBRWpFLE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBQTBCO1FBQXhCLElBQUksVUFBQSxFQUFFLEtBQUssV0FBQTtJQUMzQyxJQUFNLFVBQVUsR0FDZCxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM5RCxJQUFJLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFRCxJQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQTtJQUN6QyxJQUFNLFdBQVcsR0FBRyxVQUFVLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQTtJQUU1QyxPQUFPLFVBQUcsV0FBVyxDQUFDLFdBQVcsRUFBRSxlQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUN2RCxDQUFBO0FBQ0osQ0FBQyxDQUFBO0FBRUQsSUFBTSxTQUFTLEdBQUc7SUFDaEIsT0FBTyxFQUFFLFVBQUMsRUFBeUI7WUFBdkIsR0FBRyxTQUFBLEVBQUUsR0FBRyxTQUFBO1FBQ2xCLE9BQUEsVUFBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUU7SUFBekMsQ0FBeUM7SUFDM0MsT0FBTyxFQUFFLFVBQUMsRUFBeUI7WUFBdkIsR0FBRyxTQUFBLEVBQUUsR0FBRyxTQUFBO1FBQW9CLE9BQUEsZ0JBQWdCLENBQUMsRUFBRSxHQUFHLEtBQUEsRUFBRSxHQUFHLEtBQUEsRUFBRSxDQUFDO0lBQTlCLENBQThCO0lBQ3RFLElBQUksRUFBRSxVQUFDLEVBQXlCO1lBQXZCLEdBQUcsU0FBQSxFQUFFLEdBQUcsU0FBQTtRQUNmLE9BQUEsR0FBRyxHQUFHLEVBQUUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLENBQUMsQ0FBQyxjQUFjO1lBQ2hCLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsYUFBYSxDQUFDO0lBRi9DLENBRStDO0lBQ2pELEdBQUcsRUFBRSxVQUFDLEVBQXlCO1lBQXZCLEdBQUcsU0FBQSxFQUFFLEdBQUcsU0FBQTtRQUFvQixPQUFBLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUE5QixDQUE4QjtJQUNsRSxHQUFHLEVBQUUsVUFBQyxFQUF5QjtZQUF2QixHQUFHLFNBQUEsRUFBRSxHQUFHLFNBQUE7UUFBb0IsT0FBQSxpQkFBVSxHQUFHLGNBQUksR0FBRyxNQUFHO0lBQXZCLENBQXVCO0NBQzVELENBQUE7QUFFRCxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRyxVQUFDLEVBTWpDO1FBTEMsV0FBVyxpQkFBQSxFQUNYLE1BQU0sWUFBQTtJQUtOLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQzNCLE1BQU0sZ0RBQXlDLE1BQU0sTUFBRyxDQUFBO0lBQzFELENBQUM7SUFFRCxPQUFPLGdCQUFnQixDQUFDLFdBQVcsQ0FBQztRQUNsQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQztRQUNoQyxDQUFDLENBQUMsU0FBUyxDQUFBO0FBQ2YsQ0FBQyxDQUFBO0FBRUQsSUFBTSxnQkFBZ0IsR0FBRyxVQUFDLEVBQXlCO1FBQXZCLEdBQUcsU0FBQSxFQUFFLEdBQUcsU0FBQTtJQUNsQyxJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUE7SUFDbkIsSUFBTSxVQUFVLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQTtJQUNoQyxJQUFNLFVBQVUsR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFBO0lBRWhDLElBQU0sWUFBWSxHQUFHLEdBQUc7U0FDckIsT0FBTyxDQUFDLFNBQVMsQ0FBQztTQUNsQixRQUFRLEVBQUU7U0FDVixRQUFRLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRTVCLElBQU0sWUFBWSxHQUFHLEdBQUc7U0FDckIsT0FBTyxDQUFDLFNBQVMsQ0FBQztTQUNsQixRQUFRLEVBQUU7U0FDVixRQUFRLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFBO0lBRTVCLE9BQU8sVUFBRyxZQUFZLGNBQUksWUFBWSxDQUFFLENBQUE7QUFDMUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIENvZGljZSBGb3VuZGF0aW9uXG4gKlxuICogVGhpcyBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5IGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIExlc3NlclxuICogR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGVcbiAqIExpY2Vuc2UsIG9yIGFueSBsYXRlciB2ZXJzaW9uLlxuICpcbiAqIFRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLCBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXRcbiAqIGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2YgTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiBTZWUgdGhlIEdOVVxuICogTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy4gQSBjb3B5IG9mIHRoZSBHTlUgTGVzc2VyIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGlzIGRpc3RyaWJ1dGVkIGFsb25nIHdpdGggdGhpcyBwcm9ncmFtIGFuZCBjYW4gYmUgZm91bmQgYXRcbiAqIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvbGdwbC5odG1sPi5cbiAqXG4gKiovXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdtdC1nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBtdGdlbyBmcm9tICdtdC1nZW8nXG5pbXBvcnQgKiBhcyB1c25ncyBmcm9tICd1c25nLmpzJ1xuXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoMjU1NCkgRklYTUU6IEV4cGVjdGVkIDEgYXJndW1lbnRzLCBidXQgZ290IDAuXG5jb25zdCBjb252ZXJ0ZXIgPSBuZXcgdXNuZ3MuQ29udmVydGVyKClcbmNvbnN0IHVzbmdQcmVjaXNpb24gPSA2XG5cbmltcG9ydCB7IEF0dHJpYnV0ZSwgQ29vcmRpbmF0ZXMsIEZvcm1hdCwgdmFsaWRDb29yZGluYXRlcyB9IGZyb20gJy4nXG5pbXBvcnQgQ29tbW9uIGZyb20gJy4uLy4uL2pzL0NvbW1vbidcbmltcG9ydCB7IFN0YXJ0dXBEYXRhU3RvcmUgfSBmcm9tICcuLi8uLi9qcy9tb2RlbC9TdGFydHVwL3N0YXJ0dXAnXG5cbmV4cG9ydCBjb25zdCBmb3JtYXRBdHRyaWJ1dGUgPSAoeyBuYW1lLCB2YWx1ZSB9OiBBdHRyaWJ1dGUpOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgY29uc3QgZGVmaW5pdGlvbiA9XG4gICAgU3RhcnR1cERhdGFTdG9yZS5NZXRhY2FyZERlZmluaXRpb25zLmdldEF0dHJpYnV0ZU1hcCgpW25hbWVdXG4gIGlmIChkZWZpbml0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgaXNEYXRlID0gZGVmaW5pdGlvbi50eXBlID09PSAnREFURSdcbiAgY29uc3QgZGlzcGxheU5hbWUgPSBkZWZpbml0aW9uLmFsaWFzIHx8IG5hbWVcblxuICByZXR1cm4gYCR7ZGlzcGxheU5hbWUudG9VcHBlckNhc2UoKX06ICR7XG4gICAgaXNEYXRlID8gQ29tbW9uLmdldEh1bWFuUmVhZGFibGVEYXRlVGltZSh2YWx1ZSkgOiB2YWx1ZVxuICB9YFxufVxuXG5jb25zdCBmb3JtYXR0ZXIgPSB7XG4gIGRlZ3JlZXM6ICh7IGxhdCwgbG9uIH06IENvb3JkaW5hdGVzKSA9PlxuICAgIGAke210Z2VvLnRvTGF0KGxhdCl9ICR7bXRnZW8udG9Mb24obG9uKX1gLFxuICBkZWNpbWFsOiAoeyBsYXQsIGxvbiB9OiBDb29yZGluYXRlcykgPT4gZGVjaW1hbENvbXBvbmVudCh7IGxhdCwgbG9uIH0pLFxuICBtZ3JzOiAoeyBsYXQsIGxvbiB9OiBDb29yZGluYXRlcykgPT5cbiAgICBsYXQgPiA4NCB8fCBsYXQgPCAtODBcbiAgICAgID8gJ0luIFVQUyBTcGFjZSdcbiAgICAgIDogY29udmVydGVyLkxMdG9VU05HKGxhdCwgbG9uLCB1c25nUHJlY2lzaW9uKSxcbiAgdXRtOiAoeyBsYXQsIGxvbiB9OiBDb29yZGluYXRlcykgPT4gY29udmVydGVyLkxMdG9VVE1VUFMobGF0LCBsb24pLFxuICB3a3Q6ICh7IGxhdCwgbG9uIH06IENvb3JkaW5hdGVzKSA9PiBgUE9JTlQgKCR7bG9ufSAke2xhdH0pYCxcbn1cblxuZXhwb3J0IGNvbnN0IGZvcm1hdENvb3JkaW5hdGVzID0gKHtcbiAgY29vcmRpbmF0ZXMsXG4gIGZvcm1hdCxcbn06IHtcbiAgY29vcmRpbmF0ZXM6IENvb3JkaW5hdGVzXG4gIGZvcm1hdDogRm9ybWF0XG59KSA9PiB7XG4gIGlmICghKGZvcm1hdCBpbiBmb3JtYXR0ZXIpKSB7XG4gICAgdGhyb3cgYFVucmVjb2duaXplZCBjb29yZGluYXRlIGZvcm1hdCB2YWx1ZSBbJHtmb3JtYXR9XWBcbiAgfVxuXG4gIHJldHVybiB2YWxpZENvb3JkaW5hdGVzKGNvb3JkaW5hdGVzKVxuICAgID8gZm9ybWF0dGVyW2Zvcm1hdF0oY29vcmRpbmF0ZXMpXG4gICAgOiB1bmRlZmluZWRcbn1cblxuY29uc3QgZGVjaW1hbENvbXBvbmVudCA9ICh7IGxhdCwgbG9uIH06IENvb3JkaW5hdGVzKSA9PiB7XG4gIGNvbnN0IG51bVBsYWNlcyA9IDZcbiAgY29uc3QgbGF0UGFkZGluZyA9IG51bVBsYWNlcyArIDRcbiAgY29uc3QgbG9uUGFkZGluZyA9IG51bVBsYWNlcyArIDVcblxuICBjb25zdCBmb3JtYXR0ZWRMYXQgPSBsYXRcbiAgICAudG9GaXhlZChudW1QbGFjZXMpXG4gICAgLnRvU3RyaW5nKClcbiAgICAucGFkU3RhcnQobGF0UGFkZGluZywgJyAnKVxuXG4gIGNvbnN0IGZvcm1hdHRlZExvbiA9IGxvblxuICAgIC50b0ZpeGVkKG51bVBsYWNlcylcbiAgICAudG9TdHJpbmcoKVxuICAgIC5wYWRTdGFydChsb25QYWRkaW5nLCAnICcpXG5cbiAgcmV0dXJuIGAke2Zvcm1hdHRlZExhdH0gJHtmb3JtYXR0ZWRMb259YFxufVxuIl19