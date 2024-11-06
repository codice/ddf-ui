import { TypedUserInstance } from '../../singletons/TypedUser';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'mt-g... Remove this comment to see the full error message
import mtgeo from 'mt-geo';
import * as usngs from 'usng.js';
// @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 0.
var converter = new usngs.Converter();
var usngPrecision = 6;
/**
 * Converts wkt to the user's preferred coordinate format.
 * Falls back to the wkt if the conversion fails.
 */
export var convertWktToPreferredCoordFormat = function (wkt) {
    var coords = wkt.split(/\s/g);
    if (coords.length !== 2) {
        return wkt;
    }
    // must be in number format for LLtoUTMUPS converter
    var lon = parseFloat(coords[0]);
    var lat = parseFloat(coords[1]);
    if (isNaN(lon) || isNaN(lat)) {
        return wkt;
    }
    else {
        return convertCoordsToPreferred(lat, lon);
    }
};
/**
 * Converts coordinates from lat lon to a single string in
 * the user's preferred format
 */
export var convertCoordsToPreferred = function (lat, lon) {
    var coordFormat = TypedUserInstance.getCoordinateFormat();
    try {
        switch (coordFormat) {
            case 'degrees':
                return "".concat(mtgeo.toLat(lat), " ").concat(mtgeo.toLon(lon));
            case 'decimal':
                return "".concat(lat, " ").concat(lon);
            case 'mgrs':
                return converter.LLtoMGRSUPS(lat, lon, usngPrecision);
            case 'utm':
                return converter.LLtoUTMUPS(lat, lon);
            case 'wkt':
            default:
                return "".concat(lon, " ").concat(lat);
        }
    }
    catch (e) {
        return "".concat(lon, " ").concat(lat);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29vcmRpbmF0ZUNvbnZlcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9jb21wb25lbnQvdGFicy9tZXRhY2FyZC9jb29yZGluYXRlQ29udmVydGVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQTtBQUM5RCxtSkFBbUo7QUFDbkosT0FBTyxLQUFLLE1BQU0sUUFBUSxDQUFBO0FBQzFCLE9BQU8sS0FBSyxLQUFLLE1BQU0sU0FBUyxDQUFBO0FBQ2hDLDRFQUE0RTtBQUM1RSxJQUFNLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQTtBQUV2QyxJQUFNLGFBQWEsR0FBRyxDQUFDLENBQUE7QUFFdkI7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0sZ0NBQWdDLEdBQUcsVUFBQyxHQUFXO0lBQzFELElBQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUE7SUFFL0IsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN2QixPQUFPLEdBQUcsQ0FBQTtLQUNYO0lBRUQsb0RBQW9EO0lBQ3BELElBQU0sR0FBRyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNqQyxJQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFakMsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzVCLE9BQU8sR0FBRyxDQUFBO0tBQ1g7U0FBTTtRQUNMLE9BQU8sd0JBQXdCLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFBO0tBQzFDO0FBQ0gsQ0FBQyxDQUFBO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0sd0JBQXdCLEdBQUcsVUFBQyxHQUFXLEVBQUUsR0FBVztJQUMvRCxJQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxtQkFBbUIsRUFBRSxDQUFBO0lBRTNELElBQUk7UUFDRixRQUFRLFdBQVcsRUFBRTtZQUNuQixLQUFLLFNBQVM7Z0JBQ1osT0FBTyxVQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFBO1lBQ2xELEtBQUssU0FBUztnQkFDWixPQUFPLFVBQUcsR0FBRyxjQUFJLEdBQUcsQ0FBRSxDQUFBO1lBQ3hCLEtBQUssTUFBTTtnQkFDVCxPQUFPLFNBQVMsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQTtZQUN2RCxLQUFLLEtBQUs7Z0JBQ1IsT0FBTyxTQUFTLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtZQUN2QyxLQUFLLEtBQUssQ0FBQztZQUNYO2dCQUNFLE9BQU8sVUFBRyxHQUFHLGNBQUksR0FBRyxDQUFFLENBQUE7U0FDekI7S0FDRjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxVQUFHLEdBQUcsY0FBSSxHQUFHLENBQUUsQ0FBQTtLQUN2QjtBQUNILENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR5cGVkVXNlckluc3RhbmNlIH0gZnJvbSAnLi4vLi4vc2luZ2xldG9ucy9UeXBlZFVzZXInXG4vLyBAdHMtZXhwZWN0LWVycm9yIHRzLW1pZ3JhdGUoNzAxNikgRklYTUU6IENvdWxkIG5vdCBmaW5kIGEgZGVjbGFyYXRpb24gZmlsZSBmb3IgbW9kdWxlICdtdC1nLi4uIFJlbW92ZSB0aGlzIGNvbW1lbnQgdG8gc2VlIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2VcbmltcG9ydCBtdGdlbyBmcm9tICdtdC1nZW8nXG5pbXBvcnQgKiBhcyB1c25ncyBmcm9tICd1c25nLmpzJ1xuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAxIGFyZ3VtZW50cywgYnV0IGdvdCAwLlxuY29uc3QgY29udmVydGVyID0gbmV3IHVzbmdzLkNvbnZlcnRlcigpXG5cbmNvbnN0IHVzbmdQcmVjaXNpb24gPSA2XG5cbi8qKlxuICogQ29udmVydHMgd2t0IHRvIHRoZSB1c2VyJ3MgcHJlZmVycmVkIGNvb3JkaW5hdGUgZm9ybWF0LlxuICogRmFsbHMgYmFjayB0byB0aGUgd2t0IGlmIHRoZSBjb252ZXJzaW9uIGZhaWxzLlxuICovXG5leHBvcnQgY29uc3QgY29udmVydFdrdFRvUHJlZmVycmVkQ29vcmRGb3JtYXQgPSAod2t0OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgY29vcmRzID0gd2t0LnNwbGl0KC9cXHMvZylcblxuICBpZiAoY29vcmRzLmxlbmd0aCAhPT0gMikge1xuICAgIHJldHVybiB3a3RcbiAgfVxuXG4gIC8vIG11c3QgYmUgaW4gbnVtYmVyIGZvcm1hdCBmb3IgTEx0b1VUTVVQUyBjb252ZXJ0ZXJcbiAgY29uc3QgbG9uID0gcGFyc2VGbG9hdChjb29yZHNbMF0pXG4gIGNvbnN0IGxhdCA9IHBhcnNlRmxvYXQoY29vcmRzWzFdKVxuXG4gIGlmIChpc05hTihsb24pIHx8IGlzTmFOKGxhdCkpIHtcbiAgICByZXR1cm4gd2t0XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNvbnZlcnRDb29yZHNUb1ByZWZlcnJlZChsYXQsIGxvbilcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGNvb3JkaW5hdGVzIGZyb20gbGF0IGxvbiB0byBhIHNpbmdsZSBzdHJpbmcgaW5cbiAqIHRoZSB1c2VyJ3MgcHJlZmVycmVkIGZvcm1hdFxuICovXG5leHBvcnQgY29uc3QgY29udmVydENvb3Jkc1RvUHJlZmVycmVkID0gKGxhdDogbnVtYmVyLCBsb246IG51bWJlcik6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGNvb3JkRm9ybWF0ID0gVHlwZWRVc2VySW5zdGFuY2UuZ2V0Q29vcmRpbmF0ZUZvcm1hdCgpXG5cbiAgdHJ5IHtcbiAgICBzd2l0Y2ggKGNvb3JkRm9ybWF0KSB7XG4gICAgICBjYXNlICdkZWdyZWVzJzpcbiAgICAgICAgcmV0dXJuIGAke210Z2VvLnRvTGF0KGxhdCl9ICR7bXRnZW8udG9Mb24obG9uKX1gXG4gICAgICBjYXNlICdkZWNpbWFsJzpcbiAgICAgICAgcmV0dXJuIGAke2xhdH0gJHtsb259YFxuICAgICAgY2FzZSAnbWdycyc6XG4gICAgICAgIHJldHVybiBjb252ZXJ0ZXIuTEx0b01HUlNVUFMobGF0LCBsb24sIHVzbmdQcmVjaXNpb24pXG4gICAgICBjYXNlICd1dG0nOlxuICAgICAgICByZXR1cm4gY29udmVydGVyLkxMdG9VVE1VUFMobGF0LCBsb24pXG4gICAgICBjYXNlICd3a3QnOlxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGAke2xvbn0gJHtsYXR9YFxuICAgIH1cbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBgJHtsb259ICR7bGF0fWBcbiAgfVxufVxuIl19