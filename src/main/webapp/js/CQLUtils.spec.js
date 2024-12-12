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
import chai from 'chai';
var expect = chai.expect;
import wkx from 'wkx';
import CQLUtils from './CQLUtils';
var mockMetacardDefinitions = {
    anyText: {
        id: 'anyText',
        type: 'STRING',
        multivalued: false,
    },
    anyGeo: {
        id: 'anyGeo',
        type: 'LOCATION',
        multivalued: false,
    },
    created: {
        id: 'created',
        type: 'DATE',
        multivalued: false,
    },
};
var mockMetacardDefinitionsObject = {
    getAttributeMap: function () { return mockMetacardDefinitions; },
};
function assertCoordinateArray(actual, expected) {
    expect(actual.length).equals(expected.length);
    actual.forEach(function (point, i) {
        var expectedPoint = expected[i];
        expect(point[0]).equals(expectedPoint[0]);
        expect(point[1]).equals(expectedPoint[1]);
    });
}
function assertMultiCoordinateArray(actual, expected) {
    expect(actual.length).equals(expected.length);
    actual.forEach(function (shape, i) {
        assertCoordinateArray(shape, expected[i]);
    });
}
describe('CQL Utils', function () {
    it('strips double quotes from property', function () {
        var prop = CQLUtils.getProperty({ property: '"some property"' });
        expect(prop).to.equal('some property');
    });
    it('returns null if property is not a string', function () {
        var prop = CQLUtils.getProperty({ property: {} });
        expect(prop).to.be.null;
    });
    describe('filter to CQL and CQL to filter conversions', function () {
        // it('transform filter to CQL', () => {
        //   const cql = CQLUtils.transformFilterToCQL({
        //     type: 'INTERSECTS',
        //     property: 'anyGeo',
        //     value: 'POLYGON((1 2,3 4,5 6,1 2))',
        //   })
        //   expect(cql).to.equal('(INTERSECTS("anyGeo", POLYGON((1 2,3 4,5 6,1 2))))')
        // })
        // it('transform compound AND filter to CQL', () => {
        //   const cql = CQLUtils.transformFilterToCQL({
        //     type: 'AND',
        //     filters: [
        //       {
        //         type: 'INTERSECTS',
        //         property: 'anyGeo',
        //         value: 'LINESTRING((1 2,3 4))',
        //       },
        //       {
        //         type: 'INTERSECTS',
        //         property: 'anyGeo',
        //         value: 'POLYGON((5 6,7 8,9 10,5 6))',
        //       },
        //     ],
        //   })
        //   expect(cql).to.equal(
        //     '((INTERSECTS("anyGeo", LINESTRING((1 2,3 4)))) AND (INTERSECTS("anyGeo", POLYGON((5 6,7 8,9 10,5 6)))))'
        //   )
        // })
        // it('transform CQL to filter', () => {
        //   const cql = CQLUtils.transformCQLToFilter(
        //     '(INTERSECTS(anyGeo, POLYGON((1 2,3 4,5 6,1 2))))'
        //   )
        //   expect(cql).to.deep.equal({
        //     type: 'INTERSECTS',
        //     property: 'anyGeo',
        //     value: { type: 'GEOMETRY', value: 'POLYGON((1 2,3 4,5 6,1 2))' },
        //   })
        // })
        // it('transform compound AND CQL to filter', () => {
        //   const cql = CQLUtils.transformCQLToFilter(
        //     '((INTERSECTS(anyGeo, LINESTRING((1 2,3 4)))) AND (INTERSECTS(anyGeo, POLYGON((5 6,7 8,9 10,5 6)))))'
        //   )
        //   expect(cql).to.deep.equal({
        //     type: 'AND',
        //     filters: [
        //       {
        //         type: 'INTERSECTS',
        //         property: 'anyGeo',
        //         value: { type: 'GEOMETRY', value: 'LINESTRING((1 2,3 4))' },
        //       },
        //       {
        //         type: 'INTERSECTS',
        //         property: 'anyGeo',
        //         value: { type: 'GEOMETRY', value: 'POLYGON((5 6,7 8,9 10,5 6))' },
        //       },
        //     ],
        //   })
        // })
    });
    describe('transforms CQL', function () {
        it('removes single quotes from POLYGON WKTs in CQL', function () {
            var cql = CQLUtils.sanitizeGeometryCql("(INTERSECTS(anyGeo, 'POLYGON((-112.2 43.6,-102.1 48.3,-90.7 35.6,-112.2 43.6))'))");
            expect(cql).to.equal('(INTERSECTS(anyGeo, POLYGON((-112.2 43.6,-102.1 48.3,-90.7 35.6,-112.2 43.6))))');
        });
        it('removes single quotes from MULTIPOLYGON WKTs in CQL', function () {
            var cql = CQLUtils.sanitizeGeometryCql("(INTERSECTS(anyGeo, 'MULTIPOLYGON(((-112.2 43.6,-102.1 48.3,-90.7 35.6,-112.2 43.6)))'))");
            expect(cql).to.equal('(INTERSECTS(anyGeo, MULTIPOLYGON(((-112.2 43.6,-102.1 48.3,-90.7 35.6,-112.2 43.6)))))');
        });
        it('removes single quotes from POINT WKTs in CQL', function () {
            var cql = CQLUtils.sanitizeGeometryCql("(DWITHIN(anyGeo, 'POINT(-110.4 30.4)', 100, meters))");
            expect(cql).to.equal('(DWITHIN(anyGeo, POINT(-110.4 30.4), 100, meters))');
        });
        it('removes single quotes from LINESTRING WKTs in CQL', function () {
            var cql = CQLUtils.sanitizeGeometryCql("(DWITHIN(anyGeo, 'LINESTRING(-106.7 36.2,-87.5 46.5)', 1, meters))");
            expect(cql).to.equal('(DWITHIN(anyGeo, LINESTRING(-106.7 36.2,-87.5 46.5), 1, meters))');
        });
        it('builds CQL for POINT location', function () {
            var cql = CQLUtils.buildIntersectCQL(wkx.Geometry.parse('POINT(1 2)'));
            expect(cql).to.equal('(DWITHIN(anyGeo, POINT(1 2), 1, meters))');
        });
        it('builds CQL for LINESTRING location', function () {
            var cql = CQLUtils.buildIntersectCQL(wkx.Geometry.parse('LINESTRING(1 2, 3 4)'));
            expect(cql).to.equal('(DWITHIN(anyGeo, LINESTRING(1 2,3 4), 1, meters))');
        });
        it('builds CQL for POLYGON location', function () {
            var cql = CQLUtils.buildIntersectCQL(wkx.Geometry.parse('POLYGON((1 2, 3 4, 5 6, 1 2))'));
            expect(cql).to.equal('(INTERSECTS(anyGeo, POLYGON((1 2,3 4,5 6,1 2))))');
        });
        it('builds CQL for MULTIPOINT location', function () {
            var cql = CQLUtils.buildIntersectCQL(wkx.Geometry.parse('MULTIPOINT((1 2), (3 4))'));
            expect(cql).to.equal('(DWITHIN(anyGeo, POINT(1 2), 1, meters)) OR (DWITHIN(anyGeo, POINT(3 4), 1, meters))');
        });
        it('builds CQL for MULTILINESTRING location', function () {
            var cql = CQLUtils.buildIntersectCQL(wkx.Geometry.parse('MULTILINESTRING((1 2, 3 4), (5 6, 7 8))'));
            expect(cql).to.equal('(DWITHIN(anyGeo, LINESTRING(1 2,3 4), 1, meters)) OR (DWITHIN(anyGeo, LINESTRING(5 6,7 8), 1, meters))');
        });
        it('builds CQL for MULTIPOLYGON location', function () {
            var cql = CQLUtils.buildIntersectCQL(wkx.Geometry.parse('MULTIPOLYGON(((1 2, 3 4, 5 6, 1 2)), ((10 20, 30 40, 50 60, 10 20)))'));
            expect(cql).to.equal('(INTERSECTS(anyGeo, POLYGON((1 2,3 4,5 6,1 2)))) OR (INTERSECTS(anyGeo, POLYGON((10 20,30 40,50 60,10 20))))');
        });
        it('builds CQL for GEOMETRYCOLLECTION location', function () {
            var cql = CQLUtils.buildIntersectCQL(wkx.Geometry.parse('GEOMETRYCOLLECTION(POINT(1 2), LINESTRING(1 2, 3 4))'));
            expect(cql).to.equal('(DWITHIN(anyGeo, POINT(1 2), 1, meters)) OR (DWITHIN(anyGeo, LINESTRING(1 2,3 4), 1, meters))');
        });
    });
    describe('generates filters', function () {
        it('generates filter with anyGeo property and LINE type', function () {
            var filter = CQLUtils.generateFilter('some type', 'anyGeo', {
                type: 'LINE',
                line: [
                    [1, 1],
                    [2, 2],
                ],
                lineWidth: 5.0,
            }, mockMetacardDefinitionsObject);
            expect(filter.type).equals('DWITHIN');
            expect(filter.property).equals('anyGeo');
            expect(filter.value).equals('LINESTRING(1 1,2 2)');
            expect(filter.distance).equals(5.0);
        });
        it('generates filter with anyGeo property and POLYGON type', function () {
            var filter = CQLUtils.generateFilter('some type', 'anyGeo', {
                type: 'POLYGON',
                polygon: [
                    [1, 1],
                    [2, 2],
                    [1, 1],
                ],
            }, mockMetacardDefinitionsObject);
            expect(filter.type).equals('INTERSECTS');
            expect(filter.property).equals('anyGeo');
            expect(filter.value).equals('POLYGON((1 1,2 2,1 1))');
        });
        it('generates filter with anyGeo property and MULTIPOLYGON type', function () {
            var filter = CQLUtils.generateFilter('some type', 'anyGeo', {
                type: 'MULTIPOLYGON',
                polygon: [
                    [
                        [3.0, 50.0],
                        [4.0, 49.0],
                        [4.0, 50.0],
                        [3.0, 50.0],
                    ],
                    [
                        [8.0, 55.0],
                        [9.0, 54.0],
                        [9.0, 55.0],
                        [8.0, 55.0],
                    ],
                ],
            }, mockMetacardDefinitionsObject);
            expect(filter.type).equals('INTERSECTS');
            expect(filter.property).equals('anyGeo');
            expect(filter.value).equals('MULTIPOLYGON(((3 50,4 49,4 50,3 50)),((8 55,9 54,9 55,8 55)))');
        });
        it('generates filter with anyGeo property and BBOX type (dd)', function () {
            var filter = CQLUtils.generateFilter('some type', 'anyGeo', {
                type: 'BBOX',
                locationType: 'dd',
                west: -97,
                south: 41,
                east: -90,
                north: 46,
            }, mockMetacardDefinitionsObject);
            expect(filter.type).equals('INTERSECTS');
            expect(filter.property).equals('anyGeo');
            expect(filter.value).equals('POLYGON((-97 41,-97 46,-90 46,-90 41,-97 41))');
        });
        it('generates filter with anyGeo property and BBOX type (usng)', function () {
            var filter = CQLUtils.generateFilter('some type', 'anyGeo', {
                type: 'BBOX',
                locationType: 'usng',
                mapWest: -97,
                mapSouth: 41,
                mapEast: -90,
                mapNorth: 46,
            }, mockMetacardDefinitionsObject);
            expect(filter.type).equals('INTERSECTS');
            expect(filter.property).equals('anyGeo');
            expect(filter.value).equals('POLYGON((-97 41,-97 46,-90 46,-90 41,-97 41))');
        });
        it('generates filter with anyGeo property and POINTRADIUS type', function () {
            var filter = CQLUtils.generateFilter('some type', 'anyGeo', { type: 'POINTRADIUS', lon: 2, lat: 3, radius: 10 }, mockMetacardDefinitionsObject);
            expect(filter.type).equals('DWITHIN');
            expect(filter.property).equals('anyGeo');
            expect(filter.value).equals('POINT(2 3)');
            expect(filter.distance).equals(10);
        });
        it('generates filter with anyText property', function () {
            var filter = CQLUtils.generateFilter('some type', 'anyText', 'some value', mockMetacardDefinitionsObject);
            expect(filter.type).equals('some type');
            expect(filter.property).equals('anyText');
            expect(filter.value).equals('some value');
        });
        it('generates filter for filter function', function () {
            var filter = CQLUtils.generateFilterForFilterFunction('myFunc', { param1: 'val1' }, 
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 3.
            mockMetacardDefinitions);
            expect(filter.type).equals('=');
            expect(filter.value).to.be.true;
            expect(filter.property).to.deep.equal({
                type: 'FILTER_FUNCTION',
                filterFunctionName: 'myFunc',
                params: { param1: 'val1' },
            });
        });
        it('generates DURING filter with temporal property', function () {
            var filter = CQLUtils.generateFilter('DURING', 'created', '2018-11-01T19:00:00.000Z/2018-11-30T19:00:00.000Z', mockMetacardDefinitionsObject);
            expect(filter.type).equals('DURING');
            expect(filter.value).equals('2018-11-01T19:00:00.000Z/2018-11-30T19:00:00.000Z');
            expect(filter.from).equals('2018-11-01T19:00:00.000Z');
            expect(filter.to).equals('2018-11-30T19:00:00.000Z');
        });
    });
    describe('checks filter types', function () {
        it('DWITHIN is a geo filter', function () {
            var isGeoFilter = CQLUtils.isGeoFilter('DWITHIN');
            expect(isGeoFilter).to.be.true;
        });
        it('INTERSECTS is a geo filter', function () {
            var isGeoFilter = CQLUtils.isGeoFilter('INTERSECTS');
            expect(isGeoFilter).to.be.true;
        });
        it('AFTER is not a geo filter', function () {
            var isGeoFilter = CQLUtils.isGeoFilter('AFTER');
            expect(isGeoFilter).to.be.false;
        });
        it('filter with a POINT is a point radius', function () {
            var isPointRadiusFilter = CQLUtils.isPointRadiusFilter({
                value: 'POINT(1 1)',
            });
            expect(isPointRadiusFilter).to.be.true;
        });
        it('filter with a POINT is not a polygon', function () {
            var isPolygonFilter = CQLUtils.isPolygonFilter({
                value: 'POINT(1 1)',
            });
            expect(isPolygonFilter).to.be.false;
        });
        it('filter with a POLYGON is a polygon', function () {
            var isPolygonFilter = CQLUtils.isPolygonFilter({
                value: 'POLYGON((3 50, 4 49, 4 50, 3 50))',
            });
            expect(isPolygonFilter).to.be.true;
        });
        it('filter with a POLYGON is not a point radius', function () {
            var isPointRadiusFilter = CQLUtils.isPointRadiusFilter({
                value: 'POLYGON((3 50, 4 49, 4 50, 3 50))',
            });
            expect(isPointRadiusFilter).to.be.false;
        });
    });
    describe('parses WKTs into arrays', function () {
        it('correctly parses a POLYGON into an array', function () {
            var polygon = CQLUtils.arrayFromPolygonWkt('POLYGON((3 50, 4 49, 4 50, 3 50))');
            assertCoordinateArray(polygon, [
                [3.0, 50.0],
                [4.0, 49.0],
                [4.0, 50.0],
                [3.0, 50.0],
            ]);
        });
        it('correctly parses a MULTIPOLYGON with one POLYGON into an array', function () {
            var multipolygon = CQLUtils.arrayFromPolygonWkt('MULTIPOLYGON(((3 50, 4 49, 4 50, 3 50)))');
            assertMultiCoordinateArray(multipolygon, [
                [
                    [3.0, 50.0],
                    [4.0, 49.0],
                    [4.0, 50.0],
                    [3.0, 50.0],
                ],
            ]);
        });
        it('correctly parses a MULTIPOLYGON with multiple POLYGONs into an array', function () {
            var multipolygon = CQLUtils.arrayFromPolygonWkt('MULTIPOLYGON(((3 50, 4 49, 4 50, 3 50)), ((8 55, 9 54, 9 55, 8 55)))');
            assertMultiCoordinateArray(multipolygon, [
                [
                    [3.0, 50.0],
                    [4.0, 49.0],
                    [4.0, 50.0],
                    [3.0, 50.0],
                ],
                [
                    [8.0, 55.0],
                    [9.0, 54.0],
                    [9.0, 55.0],
                    [8.0, 55.0],
                ],
            ]);
        });
        it('correctly parses a LINESTRING into an array', function () {
            var linestring = CQLUtils.arrayFromLinestringWkt('LINESTRING(3 50, 4 49, 4 50, 3 50)');
            assertCoordinateArray(linestring, [
                [3.0, 50.0],
                [4.0, 49.0],
                [4.0, 50.0],
                [3.0, 50.0],
            ]);
        });
        it('correctly parses a MULTILINESTRING with one LINESTRING into an array', function () {
            var multilinestring = CQLUtils.arrayFromMultilinestringWkt('MULTILINESTRING((3 50, 4 49, 4 50, 3 50))');
            assertMultiCoordinateArray(multilinestring, [
                [
                    [3.0, 50.0],
                    [4.0, 49.0],
                    [4.0, 50.0],
                    [3.0, 50.0],
                ],
            ]);
        });
        it('correctly parses a MULTILINESTRING with multiple LINESTRINGs into an array', function () {
            var multilinestring = CQLUtils.arrayFromMultilinestringWkt('MULTILINESTRING((3 50, 4 49, 4 50, 3 50), (8 55, 9 54, 9 55, 8 55))');
            assertMultiCoordinateArray(multilinestring, [
                [
                    [3.0, 50.0],
                    [4.0, 49.0],
                    [4.0, 50.0],
                    [3.0, 50.0],
                ],
                [
                    [8.0, 55.0],
                    [9.0, 54.0],
                    [9.0, 55.0],
                    [8.0, 55.0],
                ],
            ]);
        });
        it('correctly parses a POINT into an array', function () {
            var point = CQLUtils.arrayFromPointWkt('POINT(3 50)');
            assertCoordinateArray(point, [[3.0, 50.0]]);
        });
        it('correctly parses a MULTIPOINT with one POINT into an array', function () {
            var multipoint = CQLUtils.arrayFromPointWkt('MULTIPOINT(3 50)');
            assertCoordinateArray(multipoint, [[3.0, 50.0]]);
        });
        it('correctly parses a MULTIPOINT with multiple POINTs into an array', function () {
            var multipoint = CQLUtils.arrayFromPointWkt('MULTIPOINT(3 50, 4 49, 4 50, 3 50)');
            assertCoordinateArray(multipoint, [
                [3.0, 50.0],
                [4.0, 49.0],
                [4.0, 50.0],
                [3.0, 50.0],
            ]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ1FMVXRpbHMuc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9tYWluL3dlYmFwcC9qcy9DUUxVdGlscy5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7O0lBYUk7QUFDSixPQUFPLElBQUksTUFBTSxNQUFNLENBQUE7QUFFdkIsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTtBQUMxQixPQUFPLEdBQUcsTUFBTSxLQUFLLENBQUE7QUFDckIsT0FBTyxRQUFRLE1BQU0sWUFBWSxDQUFBO0FBRWpDLElBQU0sdUJBQXVCLEdBQUc7SUFDOUIsT0FBTyxFQUFFO1FBQ1AsRUFBRSxFQUFFLFNBQVM7UUFDYixJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxLQUFLO0tBQ25CO0lBQ0QsTUFBTSxFQUFFO1FBQ04sRUFBRSxFQUFFLFFBQVE7UUFDWixJQUFJLEVBQUUsVUFBVTtRQUNoQixXQUFXLEVBQUUsS0FBSztLQUNuQjtJQUNELE9BQU8sRUFBRTtRQUNQLEVBQUUsRUFBRSxTQUFTO1FBQ2IsSUFBSSxFQUFFLE1BQU07UUFDWixXQUFXLEVBQUUsS0FBSztLQUNuQjtDQUNGLENBQUE7QUFFRCxJQUFNLDZCQUE2QixHQUFHO0lBQ3BDLGVBQWUsRUFBRSxjQUFNLE9BQUEsdUJBQXVCLEVBQXZCLENBQXVCO0NBQ3hDLENBQUE7QUFFUixTQUFTLHFCQUFxQixDQUFDLE1BQVcsRUFBRSxRQUFhO0lBQ3ZELE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUM3QyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBVSxFQUFFLENBQU07UUFDaEMsSUFBSSxhQUFhLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQy9CLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMs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QUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLENBQUE7WUFDakUscUJBQXFCLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xELENBQUMsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLGtFQUFrRSxFQUFFO1lBQ3JFLElBQU0sVUFBVSxHQUFHLFFBQVEsQ0FBQyxpQkFBaUIsQ0FDM0Msb0NBQW9DLENBQ3JDLENBQUE7WUFDRCxxQkFBcUIsQ0FBQyxVQUFVLEVBQUU7Z0JBQ2hDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztnQkFDWCxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUM7Z0JBQ1gsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO2dCQUNYLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQzthQUNaLENBQUMsQ0FBQTtRQUNKLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IChjKSBDb2RpY2UgRm91bmRhdGlvblxuICpcbiAqIFRoaXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeSBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBMZXNzZXJcbiAqIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlXG4gKiBMaWNlbnNlLCBvciBhbnkgbGF0ZXIgdmVyc2lvbi5cbiAqXG4gKiBUaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCwgYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0XG4gKiBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gU2VlIHRoZSBHTlVcbiAqIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuIEEgY29weSBvZiB0aGUgR05VIExlc3NlciBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBpcyBkaXN0cmlidXRlZCBhbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbSBhbmQgY2FuIGJlIGZvdW5kIGF0XG4gKiA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzL2xncGwuaHRtbD4uXG4gKlxuICoqL1xuaW1wb3J0IGNoYWkgZnJvbSAnY2hhaSdcblxuY29uc3QgZXhwZWN0ID0gY2hhaS5leHBlY3RcbmltcG9ydCB3a3ggZnJvbSAnd2t4J1xuaW1wb3J0IENRTFV0aWxzIGZyb20gJy4vQ1FMVXRpbHMnXG5cbmNvbnN0IG1vY2tNZXRhY2FyZERlZmluaXRpb25zID0ge1xuICBhbnlUZXh0OiB7XG4gICAgaWQ6ICdhbnlUZXh0JyxcbiAgICB0eXBlOiAnU1RSSU5HJyxcbiAgICBtdWx0aXZhbHVlZDogZmFsc2UsXG4gIH0sXG4gIGFueUdlbzoge1xuICAgIGlkOiAnYW55R2VvJyxcbiAgICB0eXBlOiAnTE9DQVRJT04nLFxuICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgfSxcbiAgY3JlYXRlZDoge1xuICAgIGlkOiAnY3JlYXRlZCcsXG4gICAgdHlwZTogJ0RBVEUnLFxuICAgIG11bHRpdmFsdWVkOiBmYWxzZSxcbiAgfSxcbn1cblxuY29uc3QgbW9ja01ldGFjYXJkRGVmaW5pdGlvbnNPYmplY3QgPSB7XG4gIGdldEF0dHJpYnV0ZU1hcDogKCkgPT4gbW9ja01ldGFjYXJkRGVmaW5pdGlvbnMsXG59IGFzIGFueVxuXG5mdW5jdGlvbiBhc3NlcnRDb29yZGluYXRlQXJyYXkoYWN0dWFsOiBhbnksIGV4cGVjdGVkOiBhbnkpIHtcbiAgZXhwZWN0KGFjdHVhbC5sZW5ndGgpLmVxdWFscyhleHBlY3RlZC5sZW5ndGgpXG4gIGFjdHVhbC5mb3JFYWNoKChwb2ludDogYW55LCBpOiBhbnkpID0+IHtcbiAgICBsZXQgZXhwZWN0ZWRQb2ludCA9IGV4cGVjdGVkW2ldXG4gICAgZXhwZWN0KHBvaW50WzBdKS5lcXVhbHMoZXhwZWN0ZWRQb2ludFswXSlcbiAgICBleHBlY3QocG9pbnRbMV0pLmVxdWFscyhleHBlY3RlZFBvaW50WzFdKVxuICB9KVxufVxuXG5mdW5jdGlvbiBhc3NlcnRNdWx0aUNvb3JkaW5hdGVBcnJheShhY3R1YWw6IGFueSwgZXhwZWN0ZWQ6IGFueSkge1xuICBleHBlY3QoYWN0dWFsLmxlbmd0aCkuZXF1YWxzKGV4cGVjdGVkLmxlbmd0aClcbiAgYWN0dWFsLmZvckVhY2goKHNoYXBlOiBhbnksIGk6IGFueSkgPT4ge1xuICAgIGFzc2VydENvb3JkaW5hdGVBcnJheShzaGFwZSwgZXhwZWN0ZWRbaV0pXG4gIH0pXG59XG5cbmRlc2NyaWJlKCdDUUwgVXRpbHMnLCAoKSA9PiB7XG4gIGl0KCdzdHJpcHMgZG91YmxlIHF1b3RlcyBmcm9tIHByb3BlcnR5JywgKCkgPT4ge1xuICAgIGNvbnN0IHByb3AgPSBDUUxVdGlscy5nZXRQcm9wZXJ0eSh7IHByb3BlcnR5OiAnXCJzb21lIHByb3BlcnR5XCInIH0pXG4gICAgZXhwZWN0KHByb3ApLnRvLmVxdWFsKCdzb21lIHByb3BlcnR5JylcbiAgfSlcblxuICBpdCgncmV0dXJucyBudWxsIGlmIHByb3BlcnR5IGlzIG5vdCBhIHN0cmluZycsICgpID0+IHtcbiAgICBjb25zdCBwcm9wID0gQ1FMVXRpbHMuZ2V0UHJvcGVydHkoeyBwcm9wZXJ0eToge30gfSlcbiAgICBleHBlY3QocHJvcCkudG8uYmUubnVsbFxuICB9KVxuXG4gIGRlc2NyaWJlKCdmaWx0ZXIgdG8gQ1FMIGFuZCBDUUwgdG8gZmlsdGVyIGNvbnZlcnNpb25zJywgKCkgPT4ge1xuICAgIC8vIGl0KCd0cmFuc2Zvcm0gZmlsdGVyIHRvIENRTCcsICgpID0+IHtcbiAgICAvLyAgIGNvbnN0IGNxbCA9IENRTFV0aWxzLnRyYW5zZm9ybUZpbHRlclRvQ1FMKHtcbiAgICAvLyAgICAgdHlwZTogJ0lOVEVSU0VDVFMnLFxuICAgIC8vICAgICBwcm9wZXJ0eTogJ2FueUdlbycsXG4gICAgLy8gICAgIHZhbHVlOiAnUE9MWUdPTigoMSAyLDMgNCw1IDYsMSAyKSknLFxuICAgIC8vICAgfSlcbiAgICAvLyAgIGV4cGVjdChjcWwpLnRvLmVxdWFsKCcoSU5URVJTRUNUUyhcImFueUdlb1wiLCBQT0xZR09OKCgxIDIsMyA0LDUgNiwxIDIpKSkpJylcbiAgICAvLyB9KVxuICAgIC8vIGl0KCd0cmFuc2Zvcm0gY29tcG91bmQgQU5EIGZpbHRlciB0byBDUUwnLCAoKSA9PiB7XG4gICAgLy8gICBjb25zdCBjcWwgPSBDUUxVdGlscy50cmFuc2Zvcm1GaWx0ZXJUb0NRTCh7XG4gICAgLy8gICAgIHR5cGU6ICdBTkQnLFxuICAgIC8vICAgICBmaWx0ZXJzOiBbXG4gICAgLy8gICAgICAge1xuICAgIC8vICAgICAgICAgdHlwZTogJ0lOVEVSU0VDVFMnLFxuICAgIC8vICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgIC8vICAgICAgICAgdmFsdWU6ICdMSU5FU1RSSU5HKCgxIDIsMyA0KSknLFxuICAgIC8vICAgICAgIH0sXG4gICAgLy8gICAgICAge1xuICAgIC8vICAgICAgICAgdHlwZTogJ0lOVEVSU0VDVFMnLFxuICAgIC8vICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgIC8vICAgICAgICAgdmFsdWU6ICdQT0xZR09OKCg1IDYsNyA4LDkgMTAsNSA2KSknLFxuICAgIC8vICAgICAgIH0sXG4gICAgLy8gICAgIF0sXG4gICAgLy8gICB9KVxuICAgIC8vICAgZXhwZWN0KGNxbCkudG8uZXF1YWwoXG4gICAgLy8gICAgICcoKElOVEVSU0VDVFMoXCJhbnlHZW9cIiwgTElORVNUUklORygoMSAyLDMgNCkpKSkgQU5EIChJTlRFUlNFQ1RTKFwiYW55R2VvXCIsIFBPTFlHT04oKDUgNiw3IDgsOSAxMCw1IDYpKSkpKSdcbiAgICAvLyAgIClcbiAgICAvLyB9KVxuICAgIC8vIGl0KCd0cmFuc2Zvcm0gQ1FMIHRvIGZpbHRlcicsICgpID0+IHtcbiAgICAvLyAgIGNvbnN0IGNxbCA9IENRTFV0aWxzLnRyYW5zZm9ybUNRTFRvRmlsdGVyKFxuICAgIC8vICAgICAnKElOVEVSU0VDVFMoYW55R2VvLCBQT0xZR09OKCgxIDIsMyA0LDUgNiwxIDIpKSkpJ1xuICAgIC8vICAgKVxuICAgIC8vICAgZXhwZWN0KGNxbCkudG8uZGVlcC5lcXVhbCh7XG4gICAgLy8gICAgIHR5cGU6ICdJTlRFUlNFQ1RTJyxcbiAgICAvLyAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgIC8vICAgICB2YWx1ZTogeyB0eXBlOiAnR0VPTUVUUlknLCB2YWx1ZTogJ1BPTFlHT04oKDEgMiwzIDQsNSA2LDEgMikpJyB9LFxuICAgIC8vICAgfSlcbiAgICAvLyB9KVxuICAgIC8vIGl0KCd0cmFuc2Zvcm0gY29tcG91bmQgQU5EIENRTCB0byBmaWx0ZXInLCAoKSA9PiB7XG4gICAgLy8gICBjb25zdCBjcWwgPSBDUUxVdGlscy50cmFuc2Zvcm1DUUxUb0ZpbHRlcihcbiAgICAvLyAgICAgJygoSU5URVJTRUNUUyhhbnlHZW8sIExJTkVTVFJJTkcoKDEgMiwzIDQpKSkpIEFORCAoSU5URVJTRUNUUyhhbnlHZW8sIFBPTFlHT04oKDUgNiw3IDgsOSAxMCw1IDYpKSkpKSdcbiAgICAvLyAgIClcbiAgICAvLyAgIGV4cGVjdChjcWwpLnRvLmRlZXAuZXF1YWwoe1xuICAgIC8vICAgICB0eXBlOiAnQU5EJyxcbiAgICAvLyAgICAgZmlsdGVyczogW1xuICAgIC8vICAgICAgIHtcbiAgICAvLyAgICAgICAgIHR5cGU6ICdJTlRFUlNFQ1RTJyxcbiAgICAvLyAgICAgICAgIHByb3BlcnR5OiAnYW55R2VvJyxcbiAgICAvLyAgICAgICAgIHZhbHVlOiB7IHR5cGU6ICdHRU9NRVRSWScsIHZhbHVlOiAnTElORVNUUklORygoMSAyLDMgNCkpJyB9LFxuICAgIC8vICAgICAgIH0sXG4gICAgLy8gICAgICAge1xuICAgIC8vICAgICAgICAgdHlwZTogJ0lOVEVSU0VDVFMnLFxuICAgIC8vICAgICAgICAgcHJvcGVydHk6ICdhbnlHZW8nLFxuICAgIC8vICAgICAgICAgdmFsdWU6IHsgdHlwZTogJ0dFT01FVFJZJywgdmFsdWU6ICdQT0xZR09OKCg1IDYsNyA4LDkgMTAsNSA2KSknIH0sXG4gICAgLy8gICAgICAgfSxcbiAgICAvLyAgICAgXSxcbiAgICAvLyAgIH0pXG4gICAgLy8gfSlcbiAgfSlcblxuICBkZXNjcmliZSgndHJhbnNmb3JtcyBDUUwnLCAoKSA9PiB7XG4gICAgaXQoJ3JlbW92ZXMgc2luZ2xlIHF1b3RlcyBmcm9tIFBPTFlHT04gV0tUcyBpbiBDUUwnLCAoKSA9PiB7XG4gICAgICBjb25zdCBjcWwgPSBDUUxVdGlscy5zYW5pdGl6ZUdlb21ldHJ5Q3FsKFxuICAgICAgICBcIihJTlRFUlNFQ1RTKGFueUdlbywgJ1BPTFlHT04oKC0xMTIuMiA0My42LC0xMDIuMSA0OC4zLC05MC43IDM1LjYsLTExMi4yIDQzLjYpKScpKVwiXG4gICAgICApXG4gICAgICBleHBlY3QoY3FsKS50by5lcXVhbChcbiAgICAgICAgJyhJTlRFUlNFQ1RTKGFueUdlbywgUE9MWUdPTigoLTExMi4yIDQzLjYsLTEwMi4xIDQ4LjMsLTkwLjcgMzUuNiwtMTEyLjIgNDMuNikpKSknXG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdyZW1vdmVzIHNpbmdsZSBxdW90ZXMgZnJvbSBNVUxUSVBPTFlHT04gV0tUcyBpbiBDUUwnLCAoKSA9PiB7XG4gICAgICBjb25zdCBjcWwgPSBDUUxVdGlscy5zYW5pdGl6ZUdlb21ldHJ5Q3FsKFxuICAgICAgICBcIihJTlRFUlNFQ1RTKGFueUdlbywgJ01VTFRJUE9MWUdPTigoKC0xMTIuMiA0My42LC0xMDIuMSA0OC4zLC05MC43IDM1LjYsLTExMi4yIDQzLjYpKSknKSlcIlxuICAgICAgKVxuICAgICAgZXhwZWN0KGNxbCkudG8uZXF1YWwoXG4gICAgICAgICcoSU5URVJTRUNUUyhhbnlHZW8sIE1VTFRJUE9MWUdPTigoKC0xMTIuMiA0My42LC0xMDIuMSA0OC4zLC05MC43IDM1LjYsLTExMi4yIDQzLjYpKSkpKSdcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3JlbW92ZXMgc2luZ2xlIHF1b3RlcyBmcm9tIFBPSU5UIFdLVHMgaW4gQ1FMJywgKCkgPT4ge1xuICAgICAgY29uc3QgY3FsID0gQ1FMVXRpbHMuc2FuaXRpemVHZW9tZXRyeUNxbChcbiAgICAgICAgXCIoRFdJVEhJTihhbnlHZW8sICdQT0lOVCgtMTEwLjQgMzAuNCknLCAxMDAsIG1ldGVycykpXCJcbiAgICAgIClcbiAgICAgIGV4cGVjdChjcWwpLnRvLmVxdWFsKCcoRFdJVEhJTihhbnlHZW8sIFBPSU5UKC0xMTAuNCAzMC40KSwgMTAwLCBtZXRlcnMpKScpXG4gICAgfSlcblxuICAgIGl0KCdyZW1vdmVzIHNpbmdsZSBxdW90ZXMgZnJvbSBMSU5FU1RSSU5HIFdLVHMgaW4gQ1FMJywgKCkgPT4ge1xuICAgICAgY29uc3QgY3FsID0gQ1FMVXRpbHMuc2FuaXRpemVHZW9tZXRyeUNxbChcbiAgICAgICAgXCIoRFdJVEhJTihhbnlHZW8sICdMSU5FU1RSSU5HKC0xMDYuNyAzNi4yLC04Ny41IDQ2LjUpJywgMSwgbWV0ZXJzKSlcIlxuICAgICAgKVxuICAgICAgZXhwZWN0KGNxbCkudG8uZXF1YWwoXG4gICAgICAgICcoRFdJVEhJTihhbnlHZW8sIExJTkVTVFJJTkcoLTEwNi43IDM2LjIsLTg3LjUgNDYuNSksIDEsIG1ldGVycykpJ1xuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnYnVpbGRzIENRTCBmb3IgUE9JTlQgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBjcWwgPSBDUUxVdGlscy5idWlsZEludGVyc2VjdENRTCh3a3guR2VvbWV0cnkucGFyc2UoJ1BPSU5UKDEgMiknKSlcbiAgICAgIGV4cGVjdChjcWwpLnRvLmVxdWFsKCcoRFdJVEhJTihhbnlHZW8sIFBPSU5UKDEgMiksIDEsIG1ldGVycykpJylcbiAgICB9KVxuXG4gICAgaXQoJ2J1aWxkcyBDUUwgZm9yIExJTkVTVFJJTkcgbG9jYXRpb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBjcWwgPSBDUUxVdGlscy5idWlsZEludGVyc2VjdENRTChcbiAgICAgICAgd2t4Lkdlb21ldHJ5LnBhcnNlKCdMSU5FU1RSSU5HKDEgMiwgMyA0KScpXG4gICAgICApXG4gICAgICBleHBlY3QoY3FsKS50by5lcXVhbCgnKERXSVRISU4oYW55R2VvLCBMSU5FU1RSSU5HKDEgMiwzIDQpLCAxLCBtZXRlcnMpKScpXG4gICAgfSlcblxuICAgIGl0KCdidWlsZHMgQ1FMIGZvciBQT0xZR09OIGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgY29uc3QgY3FsID0gQ1FMVXRpbHMuYnVpbGRJbnRlcnNlY3RDUUwoXG4gICAgICAgIHdreC5HZW9tZXRyeS5wYXJzZSgnUE9MWUdPTigoMSAyLCAzIDQsIDUgNiwgMSAyKSknKVxuICAgICAgKVxuICAgICAgZXhwZWN0KGNxbCkudG8uZXF1YWwoJyhJTlRFUlNFQ1RTKGFueUdlbywgUE9MWUdPTigoMSAyLDMgNCw1IDYsMSAyKSkpKScpXG4gICAgfSlcblxuICAgIGl0KCdidWlsZHMgQ1FMIGZvciBNVUxUSVBPSU5UIGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgY29uc3QgY3FsID0gQ1FMVXRpbHMuYnVpbGRJbnRlcnNlY3RDUUwoXG4gICAgICAgIHdreC5HZW9tZXRyeS5wYXJzZSgnTVVMVElQT0lOVCgoMSAyKSwgKDMgNCkpJylcbiAgICAgIClcbiAgICAgIGV4cGVjdChjcWwpLnRvLmVxdWFsKFxuICAgICAgICAnKERXSVRISU4oYW55R2VvLCBQT0lOVCgxIDIpLCAxLCBtZXRlcnMpKSBPUiAoRFdJVEhJTihhbnlHZW8sIFBPSU5UKDMgNCksIDEsIG1ldGVycykpJ1xuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnYnVpbGRzIENRTCBmb3IgTVVMVElMSU5FU1RSSU5HIGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgY29uc3QgY3FsID0gQ1FMVXRpbHMuYnVpbGRJbnRlcnNlY3RDUUwoXG4gICAgICAgIHdreC5HZW9tZXRyeS5wYXJzZSgnTVVMVElMSU5FU1RSSU5HKCgxIDIsIDMgNCksICg1IDYsIDcgOCkpJylcbiAgICAgIClcbiAgICAgIGV4cGVjdChjcWwpLnRvLmVxdWFsKFxuICAgICAgICAnKERXSVRISU4oYW55R2VvLCBMSU5FU1RSSU5HKDEgMiwzIDQpLCAxLCBtZXRlcnMpKSBPUiAoRFdJVEhJTihhbnlHZW8sIExJTkVTVFJJTkcoNSA2LDcgOCksIDEsIG1ldGVycykpJ1xuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnYnVpbGRzIENRTCBmb3IgTVVMVElQT0xZR09OIGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgY29uc3QgY3FsID0gQ1FMVXRpbHMuYnVpbGRJbnRlcnNlY3RDUUwoXG4gICAgICAgIHdreC5HZW9tZXRyeS5wYXJzZShcbiAgICAgICAgICAnTVVMVElQT0xZR09OKCgoMSAyLCAzIDQsIDUgNiwgMSAyKSksICgoMTAgMjAsIDMwIDQwLCA1MCA2MCwgMTAgMjApKSknXG4gICAgICAgIClcbiAgICAgIClcbiAgICAgIGV4cGVjdChjcWwpLnRvLmVxdWFsKFxuICAgICAgICAnKElOVEVSU0VDVFMoYW55R2VvLCBQT0xZR09OKCgxIDIsMyA0LDUgNiwxIDIpKSkpIE9SIChJTlRFUlNFQ1RTKGFueUdlbywgUE9MWUdPTigoMTAgMjAsMzAgNDAsNTAgNjAsMTAgMjApKSkpJ1xuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnYnVpbGRzIENRTCBmb3IgR0VPTUVUUllDT0xMRUNUSU9OIGxvY2F0aW9uJywgKCkgPT4ge1xuICAgICAgY29uc3QgY3FsID0gQ1FMVXRpbHMuYnVpbGRJbnRlcnNlY3RDUUwoXG4gICAgICAgIHdreC5HZW9tZXRyeS5wYXJzZShcbiAgICAgICAgICAnR0VPTUVUUllDT0xMRUNUSU9OKFBPSU5UKDEgMiksIExJTkVTVFJJTkcoMSAyLCAzIDQpKSdcbiAgICAgICAgKVxuICAgICAgKVxuICAgICAgZXhwZWN0KGNxbCkudG8uZXF1YWwoXG4gICAgICAgICcoRFdJVEhJTihhbnlHZW8sIFBPSU5UKDEgMiksIDEsIG1ldGVycykpIE9SIChEV0lUSElOKGFueUdlbywgTElORVNUUklORygxIDIsMyA0KSwgMSwgbWV0ZXJzKSknXG4gICAgICApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnZ2VuZXJhdGVzIGZpbHRlcnMnLCAoKSA9PiB7XG4gICAgaXQoJ2dlbmVyYXRlcyBmaWx0ZXIgd2l0aCBhbnlHZW8gcHJvcGVydHkgYW5kIExJTkUgdHlwZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbHRlciA9IENRTFV0aWxzLmdlbmVyYXRlRmlsdGVyKFxuICAgICAgICAnc29tZSB0eXBlJyxcbiAgICAgICAgJ2FueUdlbycsXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnTElORScsXG4gICAgICAgICAgbGluZTogW1xuICAgICAgICAgICAgWzEsIDFdLFxuICAgICAgICAgICAgWzIsIDJdLFxuICAgICAgICAgIF0sXG4gICAgICAgICAgbGluZVdpZHRoOiA1LjAsXG4gICAgICAgIH0sXG4gICAgICAgIG1vY2tNZXRhY2FyZERlZmluaXRpb25zT2JqZWN0XG4gICAgICApXG4gICAgICBleHBlY3QoZmlsdGVyLnR5cGUpLmVxdWFscygnRFdJVEhJTicpXG4gICAgICBleHBlY3QoZmlsdGVyLnByb3BlcnR5KS5lcXVhbHMoJ2FueUdlbycpXG4gICAgICBleHBlY3QoZmlsdGVyLnZhbHVlKS5lcXVhbHMoJ0xJTkVTVFJJTkcoMSAxLDIgMiknKVxuICAgICAgZXhwZWN0KGZpbHRlci5kaXN0YW5jZSkuZXF1YWxzKDUuMClcbiAgICB9KVxuXG4gICAgaXQoJ2dlbmVyYXRlcyBmaWx0ZXIgd2l0aCBhbnlHZW8gcHJvcGVydHkgYW5kIFBPTFlHT04gdHlwZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbHRlciA9IENRTFV0aWxzLmdlbmVyYXRlRmlsdGVyKFxuICAgICAgICAnc29tZSB0eXBlJyxcbiAgICAgICAgJ2FueUdlbycsXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnUE9MWUdPTicsXG4gICAgICAgICAgcG9seWdvbjogW1xuICAgICAgICAgICAgWzEsIDFdLFxuICAgICAgICAgICAgWzIsIDJdLFxuICAgICAgICAgICAgWzEsIDFdLFxuICAgICAgICAgIF0sXG4gICAgICAgIH0sXG4gICAgICAgIG1vY2tNZXRhY2FyZERlZmluaXRpb25zT2JqZWN0XG4gICAgICApXG4gICAgICBleHBlY3QoZmlsdGVyLnR5cGUpLmVxdWFscygnSU5URVJTRUNUUycpXG4gICAgICBleHBlY3QoZmlsdGVyLnByb3BlcnR5KS5lcXVhbHMoJ2FueUdlbycpXG4gICAgICBleHBlY3QoZmlsdGVyLnZhbHVlKS5lcXVhbHMoJ1BPTFlHT04oKDEgMSwyIDIsMSAxKSknKVxuICAgIH0pXG5cbiAgICBpdCgnZ2VuZXJhdGVzIGZpbHRlciB3aXRoIGFueUdlbyBwcm9wZXJ0eSBhbmQgTVVMVElQT0xZR09OIHR5cGUnLCAoKSA9PiB7XG4gICAgICBjb25zdCBmaWx0ZXIgPSBDUUxVdGlscy5nZW5lcmF0ZUZpbHRlcihcbiAgICAgICAgJ3NvbWUgdHlwZScsXG4gICAgICAgICdhbnlHZW8nLFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ01VTFRJUE9MWUdPTicsXG4gICAgICAgICAgcG9seWdvbjogW1xuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICBbMy4wLCA1MC4wXSxcbiAgICAgICAgICAgICAgWzQuMCwgNDkuMF0sXG4gICAgICAgICAgICAgIFs0LjAsIDUwLjBdLFxuICAgICAgICAgICAgICBbMy4wLCA1MC4wXSxcbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgIFs4LjAsIDU1LjBdLFxuICAgICAgICAgICAgICBbOS4wLCA1NC4wXSxcbiAgICAgICAgICAgICAgWzkuMCwgNTUuMF0sXG4gICAgICAgICAgICAgIFs4LjAsIDU1LjBdLFxuICAgICAgICAgICAgXSxcbiAgICAgICAgICBdLFxuICAgICAgICB9LFxuICAgICAgICBtb2NrTWV0YWNhcmREZWZpbml0aW9uc09iamVjdFxuICAgICAgKVxuICAgICAgZXhwZWN0KGZpbHRlci50eXBlKS5lcXVhbHMoJ0lOVEVSU0VDVFMnKVxuICAgICAgZXhwZWN0KGZpbHRlci5wcm9wZXJ0eSkuZXF1YWxzKCdhbnlHZW8nKVxuICAgICAgZXhwZWN0KGZpbHRlci52YWx1ZSkuZXF1YWxzKFxuICAgICAgICAnTVVMVElQT0xZR09OKCgoMyA1MCw0IDQ5LDQgNTAsMyA1MCkpLCgoOCA1NSw5IDU0LDkgNTUsOCA1NSkpKSdcbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ2dlbmVyYXRlcyBmaWx0ZXIgd2l0aCBhbnlHZW8gcHJvcGVydHkgYW5kIEJCT1ggdHlwZSAoZGQpJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsdGVyID0gQ1FMVXRpbHMuZ2VuZXJhdGVGaWx0ZXIoXG4gICAgICAgICdzb21lIHR5cGUnLFxuICAgICAgICAnYW55R2VvJyxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdCQk9YJyxcbiAgICAgICAgICBsb2NhdGlvblR5cGU6ICdkZCcsXG4gICAgICAgICAgd2VzdDogLTk3LFxuICAgICAgICAgIHNvdXRoOiA0MSxcbiAgICAgICAgICBlYXN0OiAtOTAsXG4gICAgICAgICAgbm9ydGg6IDQ2LFxuICAgICAgICB9LFxuICAgICAgICBtb2NrTWV0YWNhcmREZWZpbml0aW9uc09iamVjdFxuICAgICAgKVxuICAgICAgZXhwZWN0KGZpbHRlci50eXBlKS5lcXVhbHMoJ0lOVEVSU0VDVFMnKVxuICAgICAgZXhwZWN0KGZpbHRlci5wcm9wZXJ0eSkuZXF1YWxzKCdhbnlHZW8nKVxuICAgICAgZXhwZWN0KGZpbHRlci52YWx1ZSkuZXF1YWxzKFxuICAgICAgICAnUE9MWUdPTigoLTk3IDQxLC05NyA0NiwtOTAgNDYsLTkwIDQxLC05NyA0MSkpJ1xuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnZ2VuZXJhdGVzIGZpbHRlciB3aXRoIGFueUdlbyBwcm9wZXJ0eSBhbmQgQkJPWCB0eXBlICh1c25nKScsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbHRlciA9IENRTFV0aWxzLmdlbmVyYXRlRmlsdGVyKFxuICAgICAgICAnc29tZSB0eXBlJyxcbiAgICAgICAgJ2FueUdlbycsXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnQkJPWCcsXG4gICAgICAgICAgbG9jYXRpb25UeXBlOiAndXNuZycsXG4gICAgICAgICAgbWFwV2VzdDogLTk3LFxuICAgICAgICAgIG1hcFNvdXRoOiA0MSxcbiAgICAgICAgICBtYXBFYXN0OiAtOTAsXG4gICAgICAgICAgbWFwTm9ydGg6IDQ2LFxuICAgICAgICB9LFxuICAgICAgICBtb2NrTWV0YWNhcmREZWZpbml0aW9uc09iamVjdFxuICAgICAgKVxuICAgICAgZXhwZWN0KGZpbHRlci50eXBlKS5lcXVhbHMoJ0lOVEVSU0VDVFMnKVxuICAgICAgZXhwZWN0KGZpbHRlci5wcm9wZXJ0eSkuZXF1YWxzKCdhbnlHZW8nKVxuICAgICAgZXhwZWN0KGZpbHRlci52YWx1ZSkuZXF1YWxzKFxuICAgICAgICAnUE9MWUdPTigoLTk3IDQxLC05NyA0NiwtOTAgNDYsLTkwIDQxLC05NyA0MSkpJ1xuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnZ2VuZXJhdGVzIGZpbHRlciB3aXRoIGFueUdlbyBwcm9wZXJ0eSBhbmQgUE9JTlRSQURJVVMgdHlwZScsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbHRlciA9IENRTFV0aWxzLmdlbmVyYXRlRmlsdGVyKFxuICAgICAgICAnc29tZSB0eXBlJyxcbiAgICAgICAgJ2FueUdlbycsXG4gICAgICAgIHsgdHlwZTogJ1BPSU5UUkFESVVTJywgbG9uOiAyLCBsYXQ6IDMsIHJhZGl1czogMTAgfSxcbiAgICAgICAgbW9ja01ldGFjYXJkRGVmaW5pdGlvbnNPYmplY3RcbiAgICAgIClcbiAgICAgIGV4cGVjdChmaWx0ZXIudHlwZSkuZXF1YWxzKCdEV0lUSElOJylcbiAgICAgIGV4cGVjdChmaWx0ZXIucHJvcGVydHkpLmVxdWFscygnYW55R2VvJylcbiAgICAgIGV4cGVjdChmaWx0ZXIudmFsdWUpLmVxdWFscygnUE9JTlQoMiAzKScpXG4gICAgICBleHBlY3QoZmlsdGVyLmRpc3RhbmNlKS5lcXVhbHMoMTApXG4gICAgfSlcblxuICAgIGl0KCdnZW5lcmF0ZXMgZmlsdGVyIHdpdGggYW55VGV4dCBwcm9wZXJ0eScsICgpID0+IHtcbiAgICAgIGNvbnN0IGZpbHRlciA9IENRTFV0aWxzLmdlbmVyYXRlRmlsdGVyKFxuICAgICAgICAnc29tZSB0eXBlJyxcbiAgICAgICAgJ2FueVRleHQnLFxuICAgICAgICAnc29tZSB2YWx1ZScsXG4gICAgICAgIG1vY2tNZXRhY2FyZERlZmluaXRpb25zT2JqZWN0XG4gICAgICApXG4gICAgICBleHBlY3QoZmlsdGVyLnR5cGUpLmVxdWFscygnc29tZSB0eXBlJylcbiAgICAgIGV4cGVjdChmaWx0ZXIucHJvcGVydHkpLmVxdWFscygnYW55VGV4dCcpXG4gICAgICBleHBlY3QoZmlsdGVyLnZhbHVlKS5lcXVhbHMoJ3NvbWUgdmFsdWUnKVxuICAgIH0pXG5cbiAgICBpdCgnZ2VuZXJhdGVzIGZpbHRlciBmb3IgZmlsdGVyIGZ1bmN0aW9uJywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsdGVyID0gQ1FMVXRpbHMuZ2VuZXJhdGVGaWx0ZXJGb3JGaWx0ZXJGdW5jdGlvbihcbiAgICAgICAgJ215RnVuYycsXG4gICAgICAgIHsgcGFyYW0xOiAndmFsMScgfSxcbiAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciB0cy1taWdyYXRlKDI1NTQpIEZJWE1FOiBFeHBlY3RlZCAyIGFyZ3VtZW50cywgYnV0IGdvdCAzLlxuICAgICAgICBtb2NrTWV0YWNhcmREZWZpbml0aW9uc1xuICAgICAgKVxuICAgICAgZXhwZWN0KGZpbHRlci50eXBlKS5lcXVhbHMoJz0nKVxuICAgICAgZXhwZWN0KGZpbHRlci52YWx1ZSkudG8uYmUudHJ1ZVxuICAgICAgZXhwZWN0KGZpbHRlci5wcm9wZXJ0eSkudG8uZGVlcC5lcXVhbCh7XG4gICAgICAgIHR5cGU6ICdGSUxURVJfRlVOQ1RJT04nLFxuICAgICAgICBmaWx0ZXJGdW5jdGlvbk5hbWU6ICdteUZ1bmMnLFxuICAgICAgICBwYXJhbXM6IHsgcGFyYW0xOiAndmFsMScgfSxcbiAgICAgIH0pXG4gICAgfSlcblxuICAgIGl0KCdnZW5lcmF0ZXMgRFVSSU5HIGZpbHRlciB3aXRoIHRlbXBvcmFsIHByb3BlcnR5JywgKCkgPT4ge1xuICAgICAgY29uc3QgZmlsdGVyID0gQ1FMVXRpbHMuZ2VuZXJhdGVGaWx0ZXIoXG4gICAgICAgICdEVVJJTkcnLFxuICAgICAgICAnY3JlYXRlZCcsXG4gICAgICAgICcyMDE4LTExLTAxVDE5OjAwOjAwLjAwMFovMjAxOC0xMS0zMFQxOTowMDowMC4wMDBaJyxcbiAgICAgICAgbW9ja01ldGFjYXJkRGVmaW5pdGlvbnNPYmplY3RcbiAgICAgIClcbiAgICAgIGV4cGVjdChmaWx0ZXIudHlwZSkuZXF1YWxzKCdEVVJJTkcnKVxuICAgICAgZXhwZWN0KGZpbHRlci52YWx1ZSkuZXF1YWxzKFxuICAgICAgICAnMjAxOC0xMS0wMVQxOTowMDowMC4wMDBaLzIwMTgtMTEtMzBUMTk6MDA6MDAuMDAwWidcbiAgICAgIClcbiAgICAgIGV4cGVjdChmaWx0ZXIuZnJvbSkuZXF1YWxzKCcyMDE4LTExLTAxVDE5OjAwOjAwLjAwMFonKVxuICAgICAgZXhwZWN0KGZpbHRlci50bykuZXF1YWxzKCcyMDE4LTExLTMwVDE5OjAwOjAwLjAwMFonKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2NoZWNrcyBmaWx0ZXIgdHlwZXMnLCAoKSA9PiB7XG4gICAgaXQoJ0RXSVRISU4gaXMgYSBnZW8gZmlsdGVyJywgKCkgPT4ge1xuICAgICAgY29uc3QgaXNHZW9GaWx0ZXIgPSBDUUxVdGlscy5pc0dlb0ZpbHRlcignRFdJVEhJTicpXG4gICAgICBleHBlY3QoaXNHZW9GaWx0ZXIpLnRvLmJlLnRydWVcbiAgICB9KVxuXG4gICAgaXQoJ0lOVEVSU0VDVFMgaXMgYSBnZW8gZmlsdGVyJywgKCkgPT4ge1xuICAgICAgY29uc3QgaXNHZW9GaWx0ZXIgPSBDUUxVdGlscy5pc0dlb0ZpbHRlcignSU5URVJTRUNUUycpXG4gICAgICBleHBlY3QoaXNHZW9GaWx0ZXIpLnRvLmJlLnRydWVcbiAgICB9KVxuXG4gICAgaXQoJ0FGVEVSIGlzIG5vdCBhIGdlbyBmaWx0ZXInLCAoKSA9PiB7XG4gICAgICBjb25zdCBpc0dlb0ZpbHRlciA9IENRTFV0aWxzLmlzR2VvRmlsdGVyKCdBRlRFUicpXG4gICAgICBleHBlY3QoaXNHZW9GaWx0ZXIpLnRvLmJlLmZhbHNlXG4gICAgfSlcblxuICAgIGl0KCdmaWx0ZXIgd2l0aCBhIFBPSU5UIGlzIGEgcG9pbnQgcmFkaXVzJywgKCkgPT4ge1xuICAgICAgY29uc3QgaXNQb2ludFJhZGl1c0ZpbHRlciA9IENRTFV0aWxzLmlzUG9pbnRSYWRpdXNGaWx0ZXIoe1xuICAgICAgICB2YWx1ZTogJ1BPSU5UKDEgMSknLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChpc1BvaW50UmFkaXVzRmlsdGVyKS50by5iZS50cnVlXG4gICAgfSlcblxuICAgIGl0KCdmaWx0ZXIgd2l0aCBhIFBPSU5UIGlzIG5vdCBhIHBvbHlnb24nLCAoKSA9PiB7XG4gICAgICBjb25zdCBpc1BvbHlnb25GaWx0ZXIgPSBDUUxVdGlscy5pc1BvbHlnb25GaWx0ZXIoe1xuICAgICAgICB2YWx1ZTogJ1BPSU5UKDEgMSknLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChpc1BvbHlnb25GaWx0ZXIpLnRvLmJlLmZhbHNlXG4gICAgfSlcblxuICAgIGl0KCdmaWx0ZXIgd2l0aCBhIFBPTFlHT04gaXMgYSBwb2x5Z29uJywgKCkgPT4ge1xuICAgICAgY29uc3QgaXNQb2x5Z29uRmlsdGVyID0gQ1FMVXRpbHMuaXNQb2x5Z29uRmlsdGVyKHtcbiAgICAgICAgdmFsdWU6ICdQT0xZR09OKCgzIDUwLCA0IDQ5LCA0IDUwLCAzIDUwKSknLFxuICAgICAgfSlcbiAgICAgIGV4cGVjdChpc1BvbHlnb25GaWx0ZXIpLnRvLmJlLnRydWVcbiAgICB9KVxuXG4gICAgaXQoJ2ZpbHRlciB3aXRoIGEgUE9MWUdPTiBpcyBub3QgYSBwb2ludCByYWRpdXMnLCAoKSA9PiB7XG4gICAgICBjb25zdCBpc1BvaW50UmFkaXVzRmlsdGVyID0gQ1FMVXRpbHMuaXNQb2ludFJhZGl1c0ZpbHRlcih7XG4gICAgICAgIHZhbHVlOiAnUE9MWUdPTigoMyA1MCwgNCA0OSwgNCA1MCwgMyA1MCkpJyxcbiAgICAgIH0pXG4gICAgICBleHBlY3QoaXNQb2ludFJhZGl1c0ZpbHRlcikudG8uYmUuZmFsc2VcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdwYXJzZXMgV0tUcyBpbnRvIGFycmF5cycsICgpID0+IHtcbiAgICBpdCgnY29ycmVjdGx5IHBhcnNlcyBhIFBPTFlHT04gaW50byBhbiBhcnJheScsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBDUUxVdGlscy5hcnJheUZyb21Qb2x5Z29uV2t0KFxuICAgICAgICAnUE9MWUdPTigoMyA1MCwgNCA0OSwgNCA1MCwgMyA1MCkpJ1xuICAgICAgKVxuICAgICAgYXNzZXJ0Q29vcmRpbmF0ZUFycmF5KHBvbHlnb24sIFtcbiAgICAgICAgWzMuMCwgNTAuMF0sXG4gICAgICAgIFs0LjAsIDQ5LjBdLFxuICAgICAgICBbNC4wLCA1MC4wXSxcbiAgICAgICAgWzMuMCwgNTAuMF0sXG4gICAgICBdKVxuICAgIH0pXG5cbiAgICBpdCgnY29ycmVjdGx5IHBhcnNlcyBhIE1VTFRJUE9MWUdPTiB3aXRoIG9uZSBQT0xZR09OIGludG8gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICBjb25zdCBtdWx0aXBvbHlnb24gPSBDUUxVdGlscy5hcnJheUZyb21Qb2x5Z29uV2t0KFxuICAgICAgICAnTVVMVElQT0xZR09OKCgoMyA1MCwgNCA0OSwgNCA1MCwgMyA1MCkpKSdcbiAgICAgIClcbiAgICAgIGFzc2VydE11bHRpQ29vcmRpbmF0ZUFycmF5KG11bHRpcG9seWdvbiwgW1xuICAgICAgICBbXG4gICAgICAgICAgWzMuMCwgNTAuMF0sXG4gICAgICAgICAgWzQuMCwgNDkuMF0sXG4gICAgICAgICAgWzQuMCwgNTAuMF0sXG4gICAgICAgICAgWzMuMCwgNTAuMF0sXG4gICAgICAgIF0sXG4gICAgICBdKVxuICAgIH0pXG5cbiAgICBpdCgnY29ycmVjdGx5IHBhcnNlcyBhIE1VTFRJUE9MWUdPTiB3aXRoIG11bHRpcGxlIFBPTFlHT05zIGludG8gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICBjb25zdCBtdWx0aXBvbHlnb24gPSBDUUxVdGlscy5hcnJheUZyb21Qb2x5Z29uV2t0KFxuICAgICAgICAnTVVMVElQT0xZR09OKCgoMyA1MCwgNCA0OSwgNCA1MCwgMyA1MCkpLCAoKDggNTUsIDkgNTQsIDkgNTUsIDggNTUpKSknXG4gICAgICApXG4gICAgICBhc3NlcnRNdWx0aUNvb3JkaW5hdGVBcnJheShtdWx0aXBvbHlnb24sIFtcbiAgICAgICAgW1xuICAgICAgICAgIFszLjAsIDUwLjBdLFxuICAgICAgICAgIFs0LjAsIDQ5LjBdLFxuICAgICAgICAgIFs0LjAsIDUwLjBdLFxuICAgICAgICAgIFszLjAsIDUwLjBdLFxuICAgICAgICBdLFxuICAgICAgICBbXG4gICAgICAgICAgWzguMCwgNTUuMF0sXG4gICAgICAgICAgWzkuMCwgNTQuMF0sXG4gICAgICAgICAgWzkuMCwgNTUuMF0sXG4gICAgICAgICAgWzguMCwgNTUuMF0sXG4gICAgICAgIF0sXG4gICAgICBdKVxuICAgIH0pXG5cbiAgICBpdCgnY29ycmVjdGx5IHBhcnNlcyBhIExJTkVTVFJJTkcgaW50byBhbiBhcnJheScsICgpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzdHJpbmcgPSBDUUxVdGlscy5hcnJheUZyb21MaW5lc3RyaW5nV2t0KFxuICAgICAgICAnTElORVNUUklORygzIDUwLCA0IDQ5LCA0IDUwLCAzIDUwKSdcbiAgICAgIClcbiAgICAgIGFzc2VydENvb3JkaW5hdGVBcnJheShsaW5lc3RyaW5nLCBbXG4gICAgICAgIFszLjAsIDUwLjBdLFxuICAgICAgICBbNC4wLCA0OS4wXSxcbiAgICAgICAgWzQuMCwgNTAuMF0sXG4gICAgICAgIFszLjAsIDUwLjBdLFxuICAgICAgXSlcbiAgICB9KVxuXG4gICAgaXQoJ2NvcnJlY3RseSBwYXJzZXMgYSBNVUxUSUxJTkVTVFJJTkcgd2l0aCBvbmUgTElORVNUUklORyBpbnRvIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgY29uc3QgbXVsdGlsaW5lc3RyaW5nID0gQ1FMVXRpbHMuYXJyYXlGcm9tTXVsdGlsaW5lc3RyaW5nV2t0KFxuICAgICAgICAnTVVMVElMSU5FU1RSSU5HKCgzIDUwLCA0IDQ5LCA0IDUwLCAzIDUwKSknXG4gICAgICApXG4gICAgICBhc3NlcnRNdWx0aUNvb3JkaW5hdGVBcnJheShtdWx0aWxpbmVzdHJpbmcsIFtcbiAgICAgICAgW1xuICAgICAgICAgIFszLjAsIDUwLjBdLFxuICAgICAgICAgIFs0LjAsIDQ5LjBdLFxuICAgICAgICAgIFs0LjAsIDUwLjBdLFxuICAgICAgICAgIFszLjAsIDUwLjBdLFxuICAgICAgICBdLFxuICAgICAgXSlcbiAgICB9KVxuXG4gICAgaXQoJ2NvcnJlY3RseSBwYXJzZXMgYSBNVUxUSUxJTkVTVFJJTkcgd2l0aCBtdWx0aXBsZSBMSU5FU1RSSU5HcyBpbnRvIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgY29uc3QgbXVsdGlsaW5lc3RyaW5nID0gQ1FMVXRpbHMuYXJyYXlGcm9tTXVsdGlsaW5lc3RyaW5nV2t0KFxuICAgICAgICAnTVVMVElMSU5FU1RSSU5HKCgzIDUwLCA0IDQ5LCA0IDUwLCAzIDUwKSwgKDggNTUsIDkgNTQsIDkgNTUsIDggNTUpKSdcbiAgICAgIClcbiAgICAgIGFzc2VydE11bHRpQ29vcmRpbmF0ZUFycmF5KG11bHRpbGluZXN0cmluZywgW1xuICAgICAgICBbXG4gICAgICAgICAgWzMuMCwgNTAuMF0sXG4gICAgICAgICAgWzQuMCwgNDkuMF0sXG4gICAgICAgICAgWzQuMCwgNTAuMF0sXG4gICAgICAgICAgWzMuMCwgNTAuMF0sXG4gICAgICAgIF0sXG4gICAgICAgIFtcbiAgICAgICAgICBbOC4wLCA1NS4wXSxcbiAgICAgICAgICBbOS4wLCA1NC4wXSxcbiAgICAgICAgICBbOS4wLCA1NS4wXSxcbiAgICAgICAgICBbOC4wLCA1NS4wXSxcbiAgICAgICAgXSxcbiAgICAgIF0pXG4gICAgfSlcblxuICAgIGl0KCdjb3JyZWN0bHkgcGFyc2VzIGEgUE9JTlQgaW50byBhbiBhcnJheScsICgpID0+IHtcbiAgICAgIGNvbnN0IHBvaW50ID0gQ1FMVXRpbHMuYXJyYXlGcm9tUG9pbnRXa3QoJ1BPSU5UKDMgNTApJylcbiAgICAgIGFzc2VydENvb3JkaW5hdGVBcnJheShwb2ludCwgW1szLjAsIDUwLjBdXSlcbiAgICB9KVxuXG4gICAgaXQoJ2NvcnJlY3RseSBwYXJzZXMgYSBNVUxUSVBPSU5UIHdpdGggb25lIFBPSU5UIGludG8gYW4gYXJyYXknLCAoKSA9PiB7XG4gICAgICBjb25zdCBtdWx0aXBvaW50ID0gQ1FMVXRpbHMuYXJyYXlGcm9tUG9pbnRXa3QoJ01VTFRJUE9JTlQoMyA1MCknKVxuICAgICAgYXNzZXJ0Q29vcmRpbmF0ZUFycmF5KG11bHRpcG9pbnQsIFtbMy4wLCA1MC4wXV0pXG4gICAgfSlcblxuICAgIGl0KCdjb3JyZWN0bHkgcGFyc2VzIGEgTVVMVElQT0lOVCB3aXRoIG11bHRpcGxlIFBPSU5UcyBpbnRvIGFuIGFycmF5JywgKCkgPT4ge1xuICAgICAgY29uc3QgbXVsdGlwb2ludCA9IENRTFV0aWxzLmFycmF5RnJvbVBvaW50V2t0KFxuICAgICAgICAnTVVMVElQT0lOVCgzIDUwLCA0IDQ5LCA0IDUwLCAzIDUwKSdcbiAgICAgIClcbiAgICAgIGFzc2VydENvb3JkaW5hdGVBcnJheShtdWx0aXBvaW50LCBbXG4gICAgICAgIFszLjAsIDUwLjBdLFxuICAgICAgICBbNC4wLCA0OS4wXSxcbiAgICAgICAgWzQuMCwgNTAuMF0sXG4gICAgICAgIFszLjAsIDUwLjBdLFxuICAgICAgXSlcbiAgICB9KVxuICB9KVxufSlcbiJdfQ==