import { __rest } from "tslib";
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
import { expect } from 'chai';
import { FilterBuilderClass, FilterClass, } from '../component/filter-builder/filter.structure';
import cql from './cql';
import { StartupDataStore } from './model/Startup/startup';
var DatatypesJSONConfig = {
    groups: {
        Object: {
            iconConfig: {
                class: 'fa fa-file-text-o',
            },
            values: {
                Person: {
                    attributes: {
                        description: ['person'],
                    },
                    iconConfig: {
                        class: 'fa fa-user',
                    },
                },
                Group: {
                    attributes: {
                        description: ['group'],
                    },
                    iconConfig: {
                        class: 'fa fa-users',
                    },
                },
                Equipment: {
                    attributes: {
                        description: ['equipment'],
                    },
                    iconConfig: {
                        class: 'fa fa-wrench',
                    },
                },
                Platform: {
                    attributes: {
                        description: ['platform'],
                    },
                    iconConfig: {
                        class: 'fa fa-industry',
                    },
                },
                Facility: {
                    attributes: {
                        description: ['facility'],
                    },
                    iconConfig: {
                        class: 'fa fa-building',
                    },
                },
            },
        },
        Happenings: {
            iconConfig: {
                class: 'fa fa-bolt',
            },
            values: {
                Civil: {
                    attributes: {
                        description: ['civil'],
                    },
                    iconConfig: {
                        class: 'fa fa-university',
                    },
                },
                Military: {
                    attributes: {
                        description: ['military'],
                    },
                    iconConfig: {
                        class: 'fa fa-shield',
                    },
                },
                Political: {
                    attributes: {
                        description: ['political'],
                    },
                    iconConfig: {
                        class: 'fa fa-balance-scale',
                    },
                },
                Natural: {
                    attributes: {
                        description: ['natural'],
                    },
                    iconConfig: {
                        class: 'fa fa-leaf',
                    },
                },
                Other: {
                    attributes: {
                        description: ['other'],
                    },
                },
            },
        },
        'Visual Media': {
            iconConfig: {
                class: 'fa fa-camera-retro',
            },
            values: {
                Image: {
                    attributes: {
                        datatype: ['Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-picture-o',
                    },
                },
                'Moving Image': {
                    attributes: {
                        datatype: ['Moving Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-film',
                    },
                },
                'Still Image': {
                    attributes: {
                        datatype: ['Still Image'],
                    },
                    iconConfig: {
                        class: 'fa fa-camera-retro',
                    },
                },
            },
        },
    },
};
/**
 * Test all the capabilities (without boolean logic involved).
 *
 * left is input, right is expected output (can differ, we do our best effort but ultimately simplifying can change things!)
 * categorized by types so make this easier to maintain and update as needed
 */
var cqlCapabilityStrings = {
    strings: [
        "(\"anyText\" ILIKE '1')",
        "(\"anyText\" LIKE '1')",
        "(\"anyText\" = '1')",
        "(proximity('anyText',2,'second first') = true)",
        "((\"title\" IS NULL))",
    ],
    numbers: [
        "(\"media.width-pixels\" > 0)",
        "(\"media.width-pixels\" < 0)",
        "(\"media.width-pixels\" = 0)",
        "(\"media.width-pixels\" >= 0)",
        "(\"media.width-pixels\" <= 0)",
        "(\"media.width-pixels\" BETWEEN 0 AND 1)",
        "((\"media.width-pixels\" IS NULL))",
    ],
    dates: [
        "(\"modified\" BEFORE 2020-12-10T20:31:03.388Z)",
        "(\"modified\" AFTER 2020-12-10T20:31:03.388Z)",
        "(\"modified\" = 'RELATIVE(PT1S)')",
        "(\"modified\" = 'RELATIVE(PT1M)')",
        "(\"modified\" = 'RELATIVE(PT1H)')",
        "(\"modified\" = 'RELATIVE(P1D)')",
        "(\"modified\" = 'RELATIVE(P7D)')",
        "(\"modified\" = 'RELATIVE(P1M)')",
        "(\"modified\" = 'RELATIVE(P1Y)')",
        "((\"created\" IS NULL))",
    ],
    booleans: [
        "(\"enterprise\" = false)",
        "(\"enterprise\" = true)",
        "((\"enterprise\" IS NULL))",
    ],
    geometries: [
        "((\"location\" IS NULL))",
        "(INTERSECTS(\"anyGeo\", LINESTRING(-1.385015 11.713654,-2.691833 0.382483,-10.326418 8.220109)))",
        "(DWITHIN(\"anyGeo\", LINESTRING(-1.719894 11.760274,-1.611331 3.939398,-8.774062 7.567764), 500, meters))",
        "(INTERSECTS(\"anyGeo\", POLYGON((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094))))",
        "(DWITHIN(\"anyGeo\", POLYGON((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094)), 500, meters))",
        "(DWITHIN(\"anyGeo\", POINT(-2.703933 4.726838), 523283.971121, meters))",
    ],
};
var cqlMultipolygonStrings = {
    geometries: [
        {
            input: "(INTERSECTS(\"anyGeo\", \n      MULTIPOLYGON(\n        ((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094)), \n        ((0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,0.580634 10.295094)),\n        ((10 10,-10 -10,-10 10,10 10))\n      )))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [-0.580634, 10.295094],
                                [0.577341, -1.188461],
                                [-5.041638, -1.100891],
                                [-0.580634, 10.295094],
                            ],
                            type: 'POLYGON',
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [0.580634, 10.295094],
                                [0.577341, -1.188461],
                                [-5.041638, -1.100891],
                                [0.580634, 10.295094],
                            ],
                            type: 'POLYGON',
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [10, 10],
                                [-10, -10],
                                [-10, 10],
                                [10, 10],
                            ],
                            type: 'POLYGON',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", MULTIPOLYGON(((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094)))))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [-0.580634, 10.295094],
                                [0.577341, -1.188461],
                                [-5.041638, -1.100891],
                                [-0.580634, 10.295094],
                            ],
                            type: 'POLYGON',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTIPOLYGON(((-0.580634 10.295094,0.577341 -1.188461,-5.041638 -1.100891,-0.580634 10.295094))), 500, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [-0.580634, 10.295094],
                                [0.577341, -1.188461],
                                [-5.041638, -1.100891],
                                [-0.580634, 10.295094],
                            ],
                            polygonBufferWidth: '500',
                            type: 'POLYGON',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", MULTIPOLYGON(((17.704563951827325 26.80670872544821,26.69962466928798 14.956073177047667,9.280618200554649 15.313020030915167,17.704563951827325 26.80670872544821))))) OR (INTERSECTS(\"anyGeo\", MULTIPOLYGON(((37.62219839763307 22.095010254397405,48.83032960907214 32.5892477581015,50.68645324918305 21.09555906356843,40.19221574547897 17.31192241257309,37.62219839763307 22.095010254397405)))))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [17.704563951827325, 26.80670872544821],
                                [26.69962466928798, 14.956073177047667],
                                [9.280618200554649, 15.313020030915167],
                                [17.704563951827325, 26.80670872544821],
                            ],
                            type: 'POLYGON',
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            polygon: [
                                [37.62219839763307, 22.095010254397405],
                                [48.83032960907214, 32.5892477581015],
                                [50.68645324918305, 21.09555906356843],
                                [40.19221574547897, 17.31192241257309],
                                [37.62219839763307, 22.095010254397405],
                            ],
                            type: 'POLYGON',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
    ],
};
var cqlPointStrings = {
    geometries: [
        {
            input: "(INTERSECTS(\"anyGeo\", POINT(10 20)))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'AND',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", MULTIPOINT(10 20, 5 5)))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            type: 'POINTRADIUS',
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 5,
                            lon: 5,
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", POINT(10 20), 100, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            radius: '100',
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'AND',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTIPOINT(10 20), 100, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            radius: '100',
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTIPOINT(10 20, 5 5), 100, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 20,
                            lon: 10,
                            radius: '100',
                            type: 'POINTRADIUS',
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            lat: 5,
                            lon: 5,
                            radius: '100',
                            type: 'POINTRADIUS',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
    ],
};
var cqlLinestrings = {
    geometries: [
        {
            input: "(INTERSECTS(\"anyGeo\", LINESTRING(10 20, 30 30, 40 20)))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [10, 20],
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'AND',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", MULTILINESTRING((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10))))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [10, 10],
                                [20, 20],
                                [10, 40],
                            ],
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [40, 40],
                                [30, 30],
                                [40, 20],
                                [30, 10],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", LINESTRING(10 20, 30 30, 40 20), 1000, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [10, 20],
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'AND',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTILINESTRING((10 10, 20 20, 10 40)), 1000, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [10, 10],
                                [20, 20],
                                [10, 40],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", MULTILINESTRING((10 10, 20 20, 10 40), (40 40, 30 30, 40 20, 30 10)), 1000, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [10, 10],
                                [20, 20],
                                [10, 40],
                            ],
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [40, 40],
                                [30, 30],
                                [40, 20],
                                [30, 10],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
    ],
};
var cqlGeometryCollections = {
    geometries: [
        {
            input: "(INTERSECTS(\"anyGeo\", GEOMETRYCOLLECTION(POINT(10 20), LINESTRING(30 30, 40 20))))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            type: 'POINTRADIUS',
                            lat: 20,
                            lon: 10,
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(INTERSECTS(\"anyGeo\", GEOMETRYCOLLECTION(GEOMETRYCOLLECTION(POINT(10 20)), LINESTRING(30 30, 40 20))))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            type: 'POINTRADIUS',
                            lat: 20,
                            lon: 10,
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            line: [
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", GEOMETRYCOLLECTION(POINT(10 20)), 1000, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'circle',
                            type: 'POINTRADIUS',
                            lat: 20,
                            lon: 10,
                            radius: '1000',
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
        {
            input: "(DWITHIN(\"anyGeo\", GEOMETRYCOLLECTION(GEOMETRYCOLLECTION(POLYGON((10 20, 15 18, 5 9, 10 20))), LINESTRING(30 30, 40 20)), 1000, meters))",
            output: {
                filters: [
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'poly',
                            type: 'POLYGON',
                            polygonBufferWidth: '1000',
                            polygon: [
                                [10, 20],
                                [15, 18],
                                [5, 9],
                                [10, 20],
                            ],
                        },
                    },
                    {
                        negated: false,
                        property: 'anyGeo',
                        type: 'GEOMETRY',
                        value: {
                            mode: 'line',
                            type: 'LINE',
                            lineWidth: '1000',
                            line: [
                                [30, 30],
                                [40, 20],
                            ],
                        },
                    },
                ],
                negated: false,
                type: 'OR',
            },
        },
    ],
};
/**
 * Same as above, but this goes beyond just testing functions, it tests the boolean logic
 *
 * The different section is for things that technically can be simplified by boolean logic.  Due to how reconstitution works, utilizing postfix, we are forced to simplify.  If we didn't, things would get super nested (lookup postfix notation for more on why).  So in some cases, we might simplify beyond the expectation.  The two results will have parity though since we follow boolean algebra rules.
 */
var cqlBooleanLogicStrings = {
    same: [
        "(\"anyText\" ILIKE '1') AND (\"anyText\" ILIKE '2')",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2')",
        "(\"anyText\" ILIKE '1') OR (NOT ((\"anyText\" ILIKE '2')))",
        "NOT ((\"anyText\" ILIKE '%') AND (NOT ((\"anyText\" ILIKE ''))))",
        "(NOT ((\"anyText\" ILIKE '1'))) OR (NOT ((\"anyText\" ILIKE '2')))",
        "NOT ((NOT ((\"anyText\" ILIKE '1'))) OR (NOT ((\"anyText\" ILIKE '2'))))",
        "NOT ((\"anyText\" ILIKE '1') OR (NOT ((\"anyText\" ILIKE '2'))))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '')))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((NOT ((\"anyText\" ILIKE '')))))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE '') AND (\"anyText\" ILIKE ''))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '')))",
        "NOT ((\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE ''))))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '')))",
        "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '') OR ((\"anyText\" ILIKE '') AND (\"anyText\" ILIKE ''))))",
    ],
    different: [
        {
            input: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE ''))",
            output: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (\"anyText\" ILIKE '')",
        },
        {
            input: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((NOT ((\"anyText\" ILIKE ''))))",
            output: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (NOT ((\"anyText\" ILIKE '')))",
        },
        {
            input: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE ''))",
            output: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '')",
        },
        {
            input: "NOT ((\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '')))",
            output: "NOT ((\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (\"anyText\" ILIKE '') OR (\"anyText\" ILIKE ''))",
        },
        {
            input: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR ((\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '') OR ((\"anyText\" ILIKE '') AND (\"anyText\" ILIKE '')))",
            output: "(\"anyText\" ILIKE '1') OR (\"anyText\" ILIKE '2') OR (\"anyText\" ILIKE '') OR (\"anyText\" ILIKE '') OR ((\"anyText\" ILIKE '') AND (\"anyText\" ILIKE ''))",
        },
        {
            input: "NOT ((\"anyText\" ILIKE '%') AND (NOT ((\"anyText\" ILIKE '5') AND ((NOT ((\"anyText\" ILIKE '1'))) AND (\"anyText\" ILIKE '3')) AND (NOT ((\"anyText\" ILIKE '4'))))))",
            output: "NOT ((\"anyText\" ILIKE '%') AND (NOT ((\"anyText\" ILIKE '5') AND (NOT ((\"anyText\" ILIKE '1'))) AND (\"anyText\" ILIKE '3') AND (NOT ((\"anyText\" ILIKE '4'))))))",
        },
    ],
};
describe('read & write parity for capabilities, as well as boolean logic', function () {
    it('TEST GET GEO FILTERS', function () {
        var wkt = 'GEOMETRYCOLLECTION(POINT(50 40), LINESTRING(10 20, 40 50))';
        cql.getGeoFilters(wkt, 'anyGeo', '100');
        expect('test-value', 'Adding bogus expectation.').to.equal('test-value');
    });
    it('TEST LINESTRING FILTERS', function () {
        var wkt = 'LINESTRING(10 20, 40 50)';
        cql.getGeoFilters(wkt, 'anyGeo', '100');
        expect('test-value', 'Adding bogus expectation.').to.equal('test-value');
    });
    describe('test all capabilities', function () {
        for (var type in cqlCapabilityStrings) {
            cqlCapabilityStrings[type].forEach(function (capability) {
                it("".concat(capability), function () {
                    expect(capability, 'Unexpected filter value.').to.equal(cql.write(cql.read(capability)));
                });
            });
        }
    });
    describe('test all logic', function () {
        describe('where things stay the same (already simplified)', function () {
            cqlBooleanLogicStrings['same'].forEach(function (input) {
                it("".concat(input), function () {
                    expect(input, 'Unexpected filter value.').to.equal(cql.write(cql.read(input)));
                });
            });
        });
        describe('where things differ (they get simplified)', function () {
            cqlBooleanLogicStrings['different'].forEach(function (inputOutputPair) {
                it("".concat(inputOutputPair.input), function () {
                    expect(inputOutputPair.output, 'Unexpected filter value.').to.equal(cql.write(cql.read(inputOutputPair.input)));
                });
            });
        });
    });
    describe('test corner cases / special', function () {
        it('it handles escaping _ in properties that are not id', function () {
            var value = '12123123_123213123';
            var originalFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: '=',
                        property: 'title',
                        value: value,
                    }),
                ],
            });
            var cqlText = cql.write(originalFilter);
            var newFilter = cql.read(cqlText);
            var filterToCheck = newFilter.filters[0];
            expect(cqlText, "Doesn't escape properly").to.equal('("title" = \'12123123\\_123213123\')');
            expect(filterToCheck.value).to.equal(value);
        });
        it('it handles escaping _ in properties that are id', function () {
            var value = '12123123_123213123';
            var originalFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: '=',
                        property: 'id',
                        value: value,
                    }),
                ],
            });
            var cqlText = cql.write(originalFilter);
            var newFilter = cql.read(cqlText);
            var filterToCheck = newFilter.filters[0];
            expect(cql.write(originalFilter), "Doesn't escape properly").to.equal('("id" = \'12123123_123213123\')');
            expect(filterToCheck.value).to.equal(value);
        });
        it('it handles escaping _ in properties that are "id" (double wrapped!)', function () {
            var value = '12123123_123213123';
            var originalFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: '=',
                        property: '"id"',
                        value: value,
                    }),
                ],
            });
            var cqlText = cql.write(originalFilter);
            var newFilter = cql.read(cqlText);
            var filterToCheck = newFilter.filters[0];
            expect(cql.write(originalFilter), "Doesn't escape properly").to.equal('("id" = \'12123123_123213123\')');
            expect(filterToCheck.value).to.equal(value);
        });
        it("it handles escaping _ in properties that are 'id' (double wrapped!)", function () {
            var value = '12123123_123213123';
            var originalFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: '=',
                        property: "'id'",
                        value: value,
                    }),
                ],
            });
            var cqlText = cql.write(originalFilter);
            var newFilter = cql.read(cqlText);
            var filterToCheck = newFilter.filters[0];
            expect(cql.write(originalFilter), "Doesn't escape properly").to.equal('("id" = \'12123123_123213123\')');
            expect(filterToCheck.value).to.equal(value);
        });
    });
    describe('invalid filters get removed', function () {
        it('handles typical anyDate removal', function () {
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'anyDate',
                                value: '',
                                type: 'BEFORE',
                            }),
                        ],
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(\"anyText\" ILIKE '%')");
        });
        it('handles empty reserved.basic-datatype', function () {
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: [],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(\"anyText\" ILIKE '%')");
        });
        it('handles invalid values in reserved.basic-datatype', function () {
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: ['bogus'],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(\"anyText\" ILIKE '%')");
        });
        it('handles invalid values mixed with valid values in reserved.basic-datatype', function () {
            if (StartupDataStore.Configuration.config)
                StartupDataStore.Configuration.config.extra = {
                    datatypes: DatatypesJSONConfig,
                };
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: ['bogus', 'Person'],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("((((\"description\" ILIKE 'person')))) OR (\"anyText\" ILIKE '%')");
        });
        it('handles anyDate removal', function () {
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterClass({
                        property: 'anyDate',
                        value: '',
                        type: 'BEFORE',
                    }),
                    new FilterClass({
                        property: 'anyText',
                        value: '*',
                        type: 'ILIKE',
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(\"anyText\" ILIKE '%')");
        });
    });
    describe('test reserved.basic-datatype', function () {
        it('does handle a simple reserved.basic-datatype', function () {
            if (StartupDataStore.Configuration.config)
                StartupDataStore.Configuration.config.extra = {
                    datatypes: DatatypesJSONConfig,
                };
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: ['Person', 'Military'],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("((((\"description\" ILIKE 'person') OR (\"description\" ILIKE 'military'))))");
        });
        it('does handle a negated reserved.basic-datatype', function () {
            if (StartupDataStore.Configuration.config)
                StartupDataStore.Configuration.config.extra = {
                    datatypes: DatatypesJSONConfig,
                };
            var testFilter = new FilterBuilderClass({
                filters: [
                    new FilterBuilderClass({
                        negated: true,
                        type: 'AND',
                        filters: [
                            new FilterClass({
                                property: 'reserved.basic-datatype',
                                value: ['Person', 'Military'],
                                type: 'ILIKE',
                            }),
                        ],
                    }),
                ],
                type: 'OR',
            });
            expect(cql.write(testFilter)).to.equal("(NOT ((((\"description\" ILIKE 'person') OR (\"description\" ILIKE 'military')))))");
        });
    });
    describe('test boolean search', function () {
        it('does handles a simple boolean search', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE '*')",
                            error: false,
                            text: '"*"',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE '*'))");
        });
        it('does handles a simple boolean search 2', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat')",
                            error: false,
                            text: 'dog or cat',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE 'dog') or (anyText ILIKE 'cat'))");
        });
        it('does handles a simple boolean search that is empty', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "",
                            error: false,
                            text: '',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE '*'))");
        });
        it('does handles a simple boolean search with not', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: false,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish'))))");
        });
        it('does handles a simple boolean search other terms', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: false,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                    new FilterBuilderClass({
                        type: 'OR',
                        filters: [
                            new FilterClass({
                                property: 'datatype',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                            new FilterClass({
                                property: 'metadata-content-type',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                        ],
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))) AND ((\"datatype\" ILIKE 'Moving Image') OR (\"metadata-content-type\" ILIKE 'Moving Image'))");
        });
        it('does handles a simple boolean search other terms and negations', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        negated: true,
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: false,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                    new FilterBuilderClass({
                        type: 'OR',
                        filters: [
                            new FilterClass({
                                property: 'datatype',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                            new FilterClass({
                                property: 'metadata-content-type',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                        ],
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("(NOT (((anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))))) AND ((\"datatype\" ILIKE 'Moving Image') OR (\"metadata-content-type\" ILIKE 'Moving Image'))");
        });
        it('does handles a simple boolean search other terms with interspersed errors', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: true,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                    new FilterBuilderClass({
                        type: 'OR',
                        filters: [
                            new FilterClass({
                                property: 'datatype',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                            new FilterClass({
                                type: 'BOOLEAN_TEXT_SEARCH',
                                value: {
                                    cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                                    error: true,
                                    text: 'dog or cat and not (fish)',
                                },
                            }),
                            new FilterClass({
                                property: 'metadata-content-type',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                        ],
                    }),
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: true,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("((\"datatype\" ILIKE 'Moving Image') OR (\"metadata-content-type\" ILIKE 'Moving Image'))");
        });
        it('does handles a simple boolean search other terms with interspersed errors and negations', function () {
            var testFilter = new FilterBuilderClass({
                type: 'AND',
                negated: true,
                filters: [
                    new FilterClass({
                        type: 'BOOLEAN_TEXT_SEARCH',
                        negated: true,
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: true,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                    new FilterBuilderClass({
                        type: 'OR',
                        filters: [
                            new FilterClass({
                                property: 'datatype',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                            new FilterClass({
                                type: 'BOOLEAN_TEXT_SEARCH',
                                negated: true,
                                value: {
                                    cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                                    error: true,
                                    text: 'dog or cat and not (fish)',
                                },
                            }),
                            new FilterClass({
                                property: 'metadata-content-type',
                                type: 'ILIKE',
                                value: 'Moving Image',
                            }),
                        ],
                    }),
                    new FilterClass({
                        negated: true,
                        type: 'BOOLEAN_TEXT_SEARCH',
                        value: {
                            cql: "(anyText ILIKE 'dog') or (anyText ILIKE 'cat') and (NOT ((anyText ILIKE 'fish')))",
                            error: true,
                            text: 'dog or cat and not (fish)',
                        },
                    }),
                ],
            });
            expect(cql.write(testFilter)).to.equal("NOT (((\"datatype\" ILIKE 'Moving Image') OR (\"metadata-content-type\" ILIKE 'Moving Image')))");
        });
    });
    describe('multipolygon cql string read test', function () {
        cqlMultipolygonStrings.geometries.forEach(function (capability) {
            it("".concat(capability), function () {
                var filterBuilderClassOutput = cql.read(capability.input);
                var filtersArray = [];
                filterBuilderClassOutput.filters.forEach(function (filter) {
                    if (filter instanceof FilterClass) {
                        var id_1 = filter.id, newFilter = __rest(filter, ["id"]);
                        filtersArray.push(newFilter);
                    }
                });
                var id = filterBuilderClassOutput.id, expectedOutput = __rest(filterBuilderClassOutput, ["id"]);
                expectedOutput.filters = filtersArray;
                expect(expectedOutput, 'Unexpected filter value.').to.deep.equal(capability.output);
            });
        });
    });
    describe('point and multipoint cql string read test', function () {
        cqlPointStrings.geometries.forEach(function (capability) {
            it("".concat(capability), function () {
                var filterBuilderClassOutput = cql.read(capability.input);
                var filtersArray = [];
                filterBuilderClassOutput.filters.forEach(function (filter) {
                    var id = filter.id, newFilter = __rest(filter, ["id"]);
                    filtersArray.push(newFilter);
                });
                var id = filterBuilderClassOutput.id, expectedOutput = __rest(filterBuilderClassOutput, ["id"]);
                expectedOutput.filters = filtersArray;
                expect(expectedOutput, 'Unexpected filter value.').to.deep.equal(capability.output);
            });
        });
    });
    describe('linestring and multilinestring cql string read test', function () {
        cqlLinestrings.geometries.forEach(function (capability) {
            it("".concat(capability), function () {
                var filterBuilderClassOutput = cql.read(capability.input);
                var filtersArray = [];
                filterBuilderClassOutput.filters.forEach(function (filter) {
                    var id = filter.id, newFilter = __rest(filter, ["id"]);
                    filtersArray.push(newFilter);
                });
                var id = filterBuilderClassOutput.id, expectedOutput = __rest(filterBuilderClassOutput, ["id"]);
                expectedOutput.filters = filtersArray;
                expect(expectedOutput, 'Unexpected filter value.').to.deep.equal(capability.output);
            });
        });
    });
    describe('geometry collection cql string read test', function () {
        cqlGeometryCollections.geometries.forEach(function (capability) {
            it("".concat(capability), function () {
                var filterBuilderClassOutput = cql.read(capability.input);
                var filtersArray = [];
                filterBuilderClassOutput.filters.forEach(function (filter) {
                    var id = filter.id, newFilter = __rest(filter, ["id"]);
                    filtersArray.push(newFilter);
                });
                var id = filterBuilderClassOutput.id, expectedOutput = __rest(filterBuilderClassOutput, ["id"]);
                expectedOutput.filters = filtersArray;
                expect(expectedOutput, 'Unexpected filter value.').to.deep.equal(capability.output);
            });
        });
    });
});
//# sourceMappingURL=cql.spec.js.map