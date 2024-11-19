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
import wkx from 'wkx';
import errorMessages from './errors';
import DistanceUtils from '../../../js/DistanceUtils';
function convertUserValueToWKT(val) {
    val = val.split(' (').join('(').split(', ').join(',');
    val = val
        .split('MULTIPOINT')
        .map(function (value) {
        if (value.indexOf('((') === 0) {
            var endOfMultiPoint = value.indexOf('))') + 2;
            var multipointStr = value.substring(0, endOfMultiPoint);
            multipointStr = multipointStr
                .split('((')
                .join('(')
                .split('),(')
                .join(',')
                .split('))')
                .join(')');
            return multipointStr + value.substring(endOfMultiPoint);
        }
        else {
            return value;
        }
    })
        .join('MULTIPOINT');
    return val;
}
function removeTrailingZeros(wkt) {
    return wkt.replace(/[-+]?[0-9]*\.?[0-9]+/g, function (number) { return Number(number); });
}
function checkCoordinateOrder(coordinate) {
    return (coordinate[0] >= -180 &&
        coordinate[0] <= 180 &&
        coordinate[1] >= -90 &&
        coordinate[1] <= 90);
}
function checkGeometryCoordinateOrdering(geometry) {
    switch (geometry.type) {
        case 'Point':
            return checkCoordinateOrder(geometry.coordinates);
        case 'LineString':
        case 'MultiPoint':
            return geometry.coordinates.every(function (coordinate) {
                return checkCoordinateOrder(coordinate);
            });
        case 'Polygon':
        case 'MultiLineString':
            return geometry.coordinates.every(function (line) {
                return line.every(function (coordinate) { return checkCoordinateOrder(coordinate); });
            });
        case 'MultiPolygon':
            return geometry.coordinates.every(function (multipolygon) {
                return multipolygon.every(function (polygon) {
                    return polygon.every(function (coordinate) { return checkCoordinateOrder(coordinate); });
                });
            });
        case 'GeometryCollection':
            return geometry.geometries.every(function (subgeometry) {
                return checkGeometryCoordinateOrdering(subgeometry);
            });
    }
}
function checkForm(wkt) {
    try {
        var test_1 = wkx.Geometry.parse(wkt);
        return test_1.toWkt() === removeTrailingZeros(convertUserValueToWKT(wkt));
    }
    catch (err) {
        return false;
    }
}
function checkLonLatOrdering(wkt) {
    try {
        var test_2 = wkx.Geometry.parse(wkt);
        return checkGeometryCoordinateOrdering(test_2.toGeoJSON());
    }
    catch (err) {
        return false;
    }
}
function inputIsBlank(wkt) {
    return !wkt || wkt.length === 0;
}
function validateWkt(wkt) {
    if (inputIsBlank(wkt)) {
        return { valid: true, error: null };
    }
    var valid = true;
    var error = null;
    if (!checkForm(wkt)) {
        valid = false;
        error = errorMessages.malformedWkt;
    }
    else if (!checkLonLatOrdering(wkt)) {
        valid = false;
        error = errorMessages.invalidWktCoordinates;
    }
    return { valid: valid, error: error };
}
function createCoordPair(coordinate) {
    return coordinate
        .map(function (val) { return DistanceUtils.coordinateRound(val); })
        .join(' ');
}
function createLineString(coordinates) {
    return ('(' +
        coordinates
            .map(function (coord) {
            return createCoordPair(coord);
        })
            .join(', ') +
        ')');
}
function createMultiLineString(coordinates) {
    return ('(' +
        coordinates
            .map(function (line) {
            return createLineString(line);
        })
            .join(', ') +
        ')');
}
function createMultiPolygon(coordinates) {
    return ('(' +
        coordinates
            .map(function (line) {
            return createMultiLineString(line);
        })
            .join(', ') +
        ')');
}
// @ts-expect-error ts-migrate(7030) FIXME: Not all code paths return a value.
function createRoundedWktGeo(geoJson) {
    switch (geoJson.type) {
        case 'Point':
            return (geoJson.type.toUpperCase() +
                '(' +
                createCoordPair(geoJson.coordinates) +
                ')');
        case 'LineString':
        case 'MultiPoint':
            return geoJson.type.toUpperCase() + createLineString(geoJson.coordinates);
        case 'Polygon':
        case 'MultiLineString':
            return (geoJson.type.toUpperCase() + createMultiLineString(geoJson.coordinates));
        case 'MultiPolygon':
            return (geoJson.type.toUpperCase() + createMultiPolygon(geoJson.coordinates));
        case 'GeometryCollection':
            return (geoJson.type.toUpperCase() +
                '(' +
                geoJson.geometries
                    .map(function (geo) { return createRoundedWktGeo(geo); })
                    .join(', ') +
                ')');
    }
}
function roundWktCoords(wkt) {
    if (!inputIsBlank(wkt) && checkForm(wkt) && checkLonLatOrdering(wkt)) {
        var parsed = wkx.Geometry.parse(wkt);
        var geoJson = parsed.toGeoJSON();
        return createRoundedWktGeo(geoJson);
    }
    else {
        return wkt;
    }
}
export { validateWkt, roundWktCoords };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2t0LXV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21haW4vd2ViYXBwL2NvbXBvbmVudC9sb2NhdGlvbi1uZXcvdXRpbHMvd2t0LXV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFFSixPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFFckIsT0FBTyxhQUFhLE1BQU0sVUFBVSxDQUFBO0FBQ3BDLE9BQU8sYUFBYSxNQUFNLDJCQUEyQixDQUFBO0FBRXJELFNBQVMscUJBQXFCLENBQUMsR0FBUTtJQUNyQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUNyRCxHQUFHLEdBQUcsR0FBRztTQUNOLEtBQUssQ0FBQyxZQUFZLENBQUM7U0FDbkIsR0FBRyxDQUFDLFVBQUMsS0FBVTtRQUNkLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDN0IsSUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDL0MsSUFBSSxhQUFhLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUE7WUFDdkQsYUFBYSxHQUFHLGFBQWE7aUJBQzFCLEtBQUssQ0FBQyxJQUFJLENBQUM7aUJBQ1gsSUFBSSxDQUFDLEdBQUcsQ0FBQztpQkFDVCxLQUFLLENBQUMsS0FBSyxDQUFDO2lCQUNaLElBQUksQ0FBQyxHQUFHLENBQUM7aUJBQ1QsS0FBSyxDQUFDLElBQUksQ0FBQztpQkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDWixPQUFPLGFBQWEsR0FBRyxL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SSxDQUFDLFdBQVcsRUFBRSxHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FDckUsQ0FBQTtRQUNILEtBQUssb0JBQW9CO1lBQ3ZCLE9BQU8sQ0FDTCxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDMUIsR0FBRztnQkFDSCxPQUFPLENBQUMsVUFBVTtxQkFDZixHQUFHLENBQUMsVUFBQyxHQUFRLElBQUssT0FBQSxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQztxQkFDM0MsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDYixHQUFHLENBQ0osQ0FBQTtLQUNKO0FBQ0gsQ0FBQztBQUVELFNBQVMsY0FBYyxDQUFDLEdBQVE7SUFDOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksbUJBQW1CLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDcEUsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDcEMsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBQ2hDLE9BQU8sbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUE7S0FDcEM7U0FBTTtRQUNMLE9BQU8sR0FBRyxDQUFBO0tBQ1g7QUFDSCxDQUFDO0FBRUQsT0FBTyxFQUFFLFdBQVcsRUFBRSxjQUFjLEVBQUUsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuXG5pbXBvcnQgd2t4IGZyb20gJ3dreCdcblxuaW1wb3J0IGVycm9yTWVzc2FnZXMgZnJvbSAnLi9lcnJvcnMnXG5pbXBvcnQgRGlzdGFuY2VVdGlscyBmcm9tICcuLi8uLi8uLi9qcy9EaXN0YW5jZVV0aWxzJ1xuXG5mdW5jdGlvbiBjb252ZXJ0VXNlclZhbHVlVG9XS1QodmFsOiBhbnkpIHtcbiAgdmFsID0gdmFsLnNwbGl0KCcgKCcpLmpvaW4oJygnKS5zcGxpdCgnLCAnKS5qb2luKCcsJylcbiAgdmFsID0gdmFsXG4gICAgLnNwbGl0KCdNVUxUSVBPSU5UJylcbiAgICAubWFwKCh2YWx1ZTogYW55KSA9PiB7XG4gICAgICBpZiAodmFsdWUuaW5kZXhPZignKCgnKSA9PT0gMCkge1xuICAgICAgICBjb25zdCBlbmRPZk11bHRpUG9pbnQgPSB2YWx1ZS5pbmRleE9mKCcpKScpICsgMlxuICAgICAgICBsZXQgbXVsdGlwb2ludFN0ciA9IHZhbHVlLnN1YnN0cmluZygwLCBlbmRPZk11bHRpUG9pbnQpXG4gICAgICAgIG11bHRpcG9pbnRTdHIgPSBtdWx0aXBvaW50U3RyXG4gICAgICAgICAgLnNwbGl0KCcoKCcpXG4gICAgICAgICAgLmpvaW4oJygnKVxuICAgICAgICAgIC5zcGxpdCgnKSwoJylcbiAgICAgICAgICAuam9pbignLCcpXG4gICAgICAgICAgLnNwbGl0KCcpKScpXG4gICAgICAgICAgLmpvaW4oJyknKVxuICAgICAgICByZXR1cm4gbXVsdGlwb2ludFN0ciArIHZhbHVlLnN1YnN0cmluZyhlbmRPZk11bHRpUG9pbnQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICAgIC5qb2luKCdNVUxUSVBPSU5UJylcbiAgcmV0dXJuIHZhbFxufVxuXG5mdW5jdGlvbiByZW1vdmVUcmFpbGluZ1plcm9zKHdrdDogYW55KSB7XG4gIHJldHVybiB3a3QucmVwbGFjZSgvWy0rXT9bMC05XSpcXC4/WzAtOV0rL2csIChudW1iZXI6IGFueSkgPT4gTnVtYmVyKG51bWJlcikpXG59XG5cbmZ1bmN0aW9uIGNoZWNrQ29vcmRpbmF0ZU9yZGVyKGNvb3JkaW5hdGU6IGFueSkge1xuICByZXR1cm4gKFxuICAgIGNvb3JkaW5hdGVbMF0gPj0gLTE4MCAmJlxuICAgIGNvb3JkaW5hdGVbMF0gPD0gMTgwICYmXG4gICAgY29vcmRpbmF0ZVsxXSA+PSAtOTAgJiZcbiAgICBjb29yZGluYXRlWzFdIDw9IDkwXG4gIClcbn1cblxuZnVuY3Rpb24gY2hlY2tHZW9tZXRyeUNvb3JkaW5hdGVPcmRlcmluZyhnZW9tZXRyeTogYW55KSB7XG4gIHN3aXRjaCAoZ2VvbWV0cnkudHlwZSkge1xuICAgIGNhc2UgJ1BvaW50JzpcbiAgICAgIHJldHVybiBjaGVja0Nvb3JkaW5hdGVPcmRlcihnZW9tZXRyeS5jb29yZGluYXRlcylcbiAgICBjYXNlICdMaW5lU3RyaW5nJzpcbiAgICBjYXNlICdNdWx0aVBvaW50JzpcbiAgICAgIHJldHVybiBnZW9tZXRyeS5jb29yZGluYXRlcy5ldmVyeSgoY29vcmRpbmF0ZTogYW55KSA9PlxuICAgICAgICBjaGVja0Nvb3JkaW5hdGVPcmRlcihjb29yZGluYXRlKVxuICAgICAgKVxuICAgIGNhc2UgJ1BvbHlnb24nOlxuICAgIGNhc2UgJ011bHRpTGluZVN0cmluZyc6XG4gICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMuZXZlcnkoKGxpbmU6IGFueSkgPT5cbiAgICAgICAgbGluZS5ldmVyeSgoY29vcmRpbmF0ZTogYW55KSA9PiBjaGVja0Nvb3JkaW5hdGVPcmRlcihjb29yZGluYXRlKSlcbiAgICAgIClcbiAgICBjYXNlICdNdWx0aVBvbHlnb24nOlxuICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLmV2ZXJ5KChtdWx0aXBvbHlnb246IGFueSkgPT5cbiAgICAgICAgbXVsdGlwb2x5Z29uLmV2ZXJ5KChwb2x5Z29uOiBhbnkpID0+XG4gICAgICAgICAgcG9seWdvbi5ldmVyeSgoY29vcmRpbmF0ZTogYW55KSA9PiBjaGVja0Nvb3JkaW5hdGVPcmRlcihjb29yZGluYXRlKSlcbiAgICAgICAgKVxuICAgICAgKVxuICAgIGNhc2UgJ0dlb21ldHJ5Q29sbGVjdGlvbic6XG4gICAgICByZXR1cm4gZ2VvbWV0cnkuZ2VvbWV0cmllcy5ldmVyeSgoc3ViZ2VvbWV0cnk6IGFueSkgPT5cbiAgICAgICAgY2hlY2tHZW9tZXRyeUNvb3JkaW5hdGVPcmRlcmluZyhzdWJnZW9tZXRyeSlcbiAgICAgIClcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0Zvcm0od2t0OiBhbnkpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCB0ZXN0ID0gd2t4Lkdlb21ldHJ5LnBhcnNlKHdrdClcbiAgICByZXR1cm4gdGVzdC50b1drdCgpID09PSByZW1vdmVUcmFpbGluZ1plcm9zKGNvbnZlcnRVc2VyVmFsdWVUb1dLVCh3a3QpKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBjaGVja0xvbkxhdE9yZGVyaW5nKHdrdDogYW55KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgdGVzdCA9IHdreC5HZW9tZXRyeS5wYXJzZSh3a3QpXG4gICAgcmV0dXJuIGNoZWNrR2VvbWV0cnlDb29yZGluYXRlT3JkZXJpbmcodGVzdC50b0dlb0pTT04oKSlcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gaW5wdXRJc0JsYW5rKHdrdDogYW55KSB7XG4gIHJldHVybiAhd2t0IHx8IHdrdC5sZW5ndGggPT09IDBcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVXa3Qod2t0OiBhbnkpIHtcbiAgaWYgKGlucHV0SXNCbGFuayh3a3QpKSB7XG4gICAgcmV0dXJuIHsgdmFsaWQ6IHRydWUsIGVycm9yOiBudWxsIH1cbiAgfVxuXG4gIGxldCB2YWxpZCA9IHRydWVcbiAgbGV0IGVycm9yID0gbnVsbFxuICBpZiAoIWNoZWNrRm9ybSh3a3QpKSB7XG4gICAgdmFsaWQgPSBmYWxzZVxuICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy5tYWxmb3JtZWRXa3RcbiAgfSBlbHNlIGlmICghY2hlY2tMb25MYXRPcmRlcmluZyh3a3QpKSB7XG4gICAgdmFsaWQgPSBmYWxzZVxuICAgIGVycm9yID0gZXJyb3JNZXNzYWdlcy5pbnZhbGlkV2t0Q29vcmRpbmF0ZXNcbiAgfVxuICByZXR1cm4geyB2YWxpZCwgZXJyb3IgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDb29yZFBhaXIoY29vcmRpbmF0ZTogYW55KSB7XG4gIHJldHVybiBjb29yZGluYXRlXG4gICAgLm1hcCgodmFsOiBhbnkpID0+IERpc3RhbmNlVXRpbHMuY29vcmRpbmF0ZVJvdW5kKHZhbCkpXG4gICAgLmpvaW4oJyAnKVxufVxuXG5mdW5jdGlvbiBjcmVhdGVMaW5lU3RyaW5nKGNvb3JkaW5hdGVzOiBhbnkpIHtcbiAgcmV0dXJuIChcbiAgICAnKCcgK1xuICAgIGNvb3JkaW5hdGVzXG4gICAgICAubWFwKChjb29yZDogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVDb29yZFBhaXIoY29vcmQpXG4gICAgICB9KVxuICAgICAgLmpvaW4oJywgJykgK1xuICAgICcpJ1xuICApXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU11bHRpTGluZVN0cmluZyhjb29yZGluYXRlczogYW55KSB7XG4gIHJldHVybiAoXG4gICAgJygnICtcbiAgICBjb29yZGluYXRlc1xuICAgICAgLm1hcCgobGluZTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVMaW5lU3RyaW5nKGxpbmUpXG4gICAgICB9KVxuICAgICAgLmpvaW4oJywgJykgK1xuICAgICcpJ1xuICApXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU11bHRpUG9seWdvbihjb29yZGluYXRlczogYW55KSB7XG4gIHJldHVybiAoXG4gICAgJygnICtcbiAgICBjb29yZGluYXRlc1xuICAgICAgLm1hcCgobGluZTogYW55KSA9PiB7XG4gICAgICAgIHJldHVybiBjcmVhdGVNdWx0aUxpbmVTdHJpbmcobGluZSlcbiAgICAgIH0pXG4gICAgICAuam9pbignLCAnKSArXG4gICAgJyknXG4gIClcbn1cblxuLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDcwMzApIEZJWE1FOiBOb3QgYWxsIGNvZGUgcGF0aHMgcmV0dXJuIGEgdmFsdWUuXG5mdW5jdGlvbiBjcmVhdGVSb3VuZGVkV2t0R2VvKGdlb0pzb246IGFueSkge1xuICBzd2l0Y2ggKGdlb0pzb24udHlwZSkge1xuICAgIGNhc2UgJ1BvaW50JzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGdlb0pzb24udHlwZS50b1VwcGVyQ2FzZSgpICtcbiAgICAgICAgJygnICtcbiAgICAgICAgY3JlYXRlQ29vcmRQYWlyKGdlb0pzb24uY29vcmRpbmF0ZXMpICtcbiAgICAgICAgJyknXG4gICAgICApXG4gICAgY2FzZSAnTGluZVN0cmluZyc6XG4gICAgY2FzZSAnTXVsdGlQb2ludCc6XG4gICAgICByZXR1cm4gZ2VvSnNvbi50eXBlLnRvVXBwZXJDYXNlKCkgKyBjcmVhdGVMaW5lU3RyaW5nKGdlb0pzb24uY29vcmRpbmF0ZXMpXG4gICAgY2FzZSAnUG9seWdvbic6XG4gICAgY2FzZSAnTXVsdGlMaW5lU3RyaW5nJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGdlb0pzb24udHlwZS50b1VwcGVyQ2FzZSgpICsgY3JlYXRlTXVsdGlMaW5lU3RyaW5nKGdlb0pzb24uY29vcmRpbmF0ZXMpXG4gICAgICApXG4gICAgY2FzZSAnTXVsdGlQb2x5Z29uJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGdlb0pzb24udHlwZS50b1VwcGVyQ2FzZSgpICsgY3JlYXRlTXVsdGlQb2x5Z29uKGdlb0pzb24uY29vcmRpbmF0ZXMpXG4gICAgICApXG4gICAgY2FzZSAnR2VvbWV0cnlDb2xsZWN0aW9uJzpcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGdlb0pzb24udHlwZS50b1VwcGVyQ2FzZSgpICtcbiAgICAgICAgJygnICtcbiAgICAgICAgZ2VvSnNvbi5nZW9tZXRyaWVzXG4gICAgICAgICAgLm1hcCgoZ2VvOiBhbnkpID0+IGNyZWF0ZVJvdW5kZWRXa3RHZW8oZ2VvKSlcbiAgICAgICAgICAuam9pbignLCAnKSArXG4gICAgICAgICcpJ1xuICAgICAgKVxuICB9XG59XG5cbmZ1bmN0aW9uIHJvdW5kV2t0Q29vcmRzKHdrdDogYW55KSB7XG4gIGlmICghaW5wdXRJc0JsYW5rKHdrdCkgJiYgY2hlY2tGb3JtKHdrdCkgJiYgY2hlY2tMb25MYXRPcmRlcmluZyh3a3QpKSB7XG4gICAgbGV0IHBhcnNlZCA9IHdreC5HZW9tZXRyeS5wYXJzZSh3a3QpXG4gICAgbGV0IGdlb0pzb24gPSBwYXJzZWQudG9HZW9KU09OKClcbiAgICByZXR1cm4gY3JlYXRlUm91bmRlZFdrdEdlbyhnZW9Kc29uKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB3a3RcbiAgfVxufVxuXG5leHBvcnQgeyB2YWxpZGF0ZVdrdCwgcm91bmRXa3RDb29yZHMgfVxuIl19